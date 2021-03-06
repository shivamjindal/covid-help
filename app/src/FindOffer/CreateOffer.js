import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { Dialog, DialogTitle, DialogContent, Paper, Grid, TextField, Button, Typography, FormControlLabel, FormHelperText, Checkbox, Link } from '@material-ui/core';
import { useInput } from '../hooks/input-hook';
import { DropzoneArea } from 'material-ui-dropzone';
import { withOktaAuth } from '@okta/okta-react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import FormData from 'form-data'
import { geocodeByAddress } from 'react-google-places-autocomplete';
import parse from 'autosuggest-highlight/parse';
import throttle from 'lodash/throttle';

import Resizer from 'react-image-file-resizer';
import axios from 'axios';

const BASE_URL = 'http://localhost:8080'

const useStyles = makeStyles(theme => ({
    root: {
        padding: 25,
        minWidth: 400,
    },
    closeDialog: {
        color: "gray!important",
        "&:hover": {
            textDecoration: "underline!important",
            color: "#42a5f5!important"
        }
    },
    zone: {
        borderRadius: 5,
        paddingTop: 15,
        "& p": {
            fontSize: 16,
            fontFamily: 'Roboto',
            color: 'gray',
        }
    },
    submit: {
        color: "white",
    },
    icon: {
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(2),
    },
}));

function loadScript(src, position, id) {
    if (!position) {
        return;
    }

    const script = document.createElement('script');
    script.setAttribute('async', '');
    script.setAttribute('id', id);
    script.src = src;
    position.appendChild(script);
}

const autocompleteService = { current: null };

function CreateOffer(props) {
    const accessToken = props.authState.accessToken;
    const classes = useStyles();

    const [lgbtq, setLgbtq] = useState(false);
    const [accessibility, setAccessibility] = useState(false);
    const [images, setImages] = useState([]);
    const [inputValue, setInputValue] = React.useState('');
    const [options, setOptions] = React.useState([]);
    const loaded = React.useRef(false);

    const { value: listingName, bind: bindListingName } = useInput('');
    const { value: addressOne, setValue: setAddy1, bind: bindAddressOne } = useInput('');
    const { value: addressTwo, bind: bindAddressTwo } = useInput('');
    const { value: neighborhood, setValue: setNeighborhood, bind: bindNeighborhood } = useInput('');
    const { value: city, setValue: setCity, bind: bindCity } = useInput('');
    const { value: state, setValue: setState, bind: bindState } = useInput('');
    const { value: zipcode, setValue: setZip, bind: bindZipcode } = useInput('');
    const { value: accessibilityInfo, bind: bindAccesibilityInfo } = useInput('');
    const { value: livingSituation, bind: bindLivingSituation } = useInput('');
    const { value: description, bind: bindDescription } = useInput('');
    const { value: housingRules, bind: bindHousingRules } = useInput('');

    // TODO: snackbar and check

    const handleSubmit = async (e) => {
        e.preventDefault();

        const fd = new FormData();
        // for(var image of images) {
        //     fd.append('images', image);
        // }
        fd.append('images', JSON.stringify(images));

        fd.append('listingName', listingName)
        fd.append('addressLineOne', addressOne)
        fd.append('addressLineTwo', addressTwo)
        fd.append('city', city)
        fd.append('state', state)
        fd.append('zipCode', zipcode)
        fd.append('neighborhood', neighborhood)
        fd.append('housingRules', housingRules)
        fd.append('lgbtqpFriendly', lgbtq)
        fd.append('accessibilityFriendly', accessibility)
        fd.append('accessibilityInfo', accessibilityInfo)
        fd.append('livingSituation', livingSituation)
        fd.append('housingInfo', description)

        console.log('4 - appended all other field')
        console.log(fd.get('images')[0]);
        var config = {
            headers: {
                "Content-type": "multipart/form-data",
                'Access-Control-Allow-Origin': '*',
                'Authorization': `Bearer ${accessToken}`,
            },
        };
        axios.post(BASE_URL + '/createListing', fd, config)
            .then(function (response) {
                props.openSnackBar({ severity: 'success', message: 'Succesfully created new listing!' });
                props.handleClose();
                props.refreshOffers();
            })
            .catch(function (error) {
                console.log(error);
                props.openSnackBar({ severity: 'error', message: 'Unable to create new listing, please try again.' });
            });
    };

    if (typeof window !== 'undefined' && !loaded.current) {
        if (!document.querySelector('#google-maps')) {
            loadScript(
                'https://maps.googleapis.com/maps/api/js?key=' + process.env.REACT_APP_GOOGLE_MAPS_API + '&libraries=places',
                document.querySelector('head'),
                'google-maps',
            );
        }

        loaded.current = true;
    }

    const handleChange = (event, value, reason) => {
        setInputValue(event.target.value);
    };

    const handleOnChange = (event, location, reason) => {
        if (reason === 'select-option') {
            clearLocation();
            setInputValue(location.structured_formatting.main_text)
            setAddy1(location.structured_formatting.main_text)
            geocodeByAddress(location.description)
                .then(results => handleLocationAutoComplete(results[0]))
                .catch(error => console.error(error));
        }
        else if (reason === 'clear') {
            clearLocation();
        }
    }

    const handleOnClose = (event) => {
        if (event.target.value) {
            setInputValue(event.target.value);
        }
    }

    const handleFile = (files) => {
        let resizedImages = [];
        if (files) {
            files.forEach(file => {
                Resizer.imageFileResizer(
                    file,
                    1500,
                    1500,
                    'JPEG',
                    90,
                    0,
                    uri => {
                        let encodedUri = encodeURI(uri);
                        resizedImages.push(encodedUri)
                        setImages(resizedImages);
                    },
                    'base64'
                );
            })
        } else {
            return;
        }
    }

    const clearLocation = () => {
        setNeighborhood('')
        setCity('')
        setState('')
        setAddy1('')
        setZip('')
    }

    const handleLocationAutoComplete = (listingLocation) => {
        var componentForm = {
            street_number: 'short_name',
            route: 'long_name',
            neighborhood: 'long_name',
            locality: 'short_name',
            administrative_area_level_1: 'short_name',
            postal_code: 'short_name'
        };
        var results = {}
        for (var i = 0; i < listingLocation.address_components.length; i++) {
            var addressType = listingLocation.address_components[i].types[0];
            if (componentForm[addressType]) {
                var val = listingLocation.address_components[i][componentForm[addressType]];
                results[addressType] = val;
            }
        }
        if (results['neighborhood']) {
            setNeighborhood(results['neighborhood'])
        }
        if (results['locality']) {
            setCity(results['locality'])
        }
        if (results['administrative_area_level_1']) {
            setState(results['administrative_area_level_1'])
        }
        if (results['postal_code']) {
            setZip(results['postal_code'])
        }
        if (results['street_number'] && results['route']) {
            setAddy1(results['street_number'] + " " + results['route'])
        }
    }

    const fetch = React.useMemo(
        () =>
            throttle((request, callback) => {
                autocompleteService.current.getPlacePredictions(request, callback);
            }, 200),
        [],
    );

    React.useEffect(() => {
        let active = true;

        if (!autocompleteService.current && window.google) {
            autocompleteService.current = new window.google.maps.places.AutocompleteService();
        }
        if (!autocompleteService.current) {
            return undefined;
        }

        if (inputValue === '') {
            setOptions([]);
            return undefined;
        }

        fetch({ input: inputValue }, (results) => {
            if (active) {
                setOptions(results || []);
            }
        });

        return () => {
            active = false;
        };
    }, [inputValue, fetch]);



    return (
        <React.Fragment>
            <Dialog
                open={props.open}
                onClose={() => props.handleClose()}
                aria-labelledby="alert-dialog-title"
                style={{ minWidth: 450 }}
            >
                <Paper className={classes.root}>
                    <Link onClick={() => props.handleClose()} style={{ float: "right" }} className={classes.closeDialog}>
                        close
                    </Link>
                    <DialogTitle disableTypography={true} id="alert-dialog-title">
                        <Typography color="primary" variant="h5">
                            Add Listing
                        </Typography>
                    </DialogTitle>
                    <DialogContent>
                        <form onSubmit={handleSubmit}>
                            <Grid container spacing={2} style={{ paddingBottom: 20 }}>
                                <Grid item xs={12}>
                                    <TextField
                                        {...bindListingName}
                                        name="listingName"
                                        variant="outlined"
                                        required
                                        fullWidth
                                        id="listingName"
                                        label="Listing Name"
                                        autoFocus
                                        helperText="Please provide a short description name for your listing. (i.e. 'My Couch')"
                                    />

                                </Grid>
                                <Grid item xs={12}>
                                    {/* <input
                                        // {...bindAddressOne}
                                        // autoComplete="street-address"
                                        // name="addyOne"
                                        // variant="outlined"
                                        // className="input-field"
                                        ref={textInput}
                                        required
                                        // fullWidth
                                        id="autocomplete"
                                        // label="Address 1"
                                        type="text"
                                    /> */}
                                    {/* <GooglePlacesAutocomplete id="addyOne" name="addyOne"
                                        apiKey={process.env.REACT_APP_GOOGLE_MAPS_API}
                                        onSelect={({ description }) => {
                                            console.log(description);
                                            geocodeByAddress(description)
                                                .then(results => handleLocationAutoComplete(results[0]))
                                                .catch(error => console.error(error));
                                        }}
                                    /> */}
                                    <Autocomplete
                                        id="addressLineOne"
                                        freeSolo
                                        value={addressOne}
                                        style={{ width: '100%' }}
                                        getOptionLabel={(option) => (typeof option === 'string' ? option : option.description)}
                                        filterOptions={(x) => x}
                                        options={options}
                                        autoComplete
                                        includeInputInList
                                        onChange={handleOnChange}
                                        onClose={handleOnClose}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                required
                                                label="Address 1"
                                                variant="outlined"
                                                fullWidth
                                                onChange={handleChange}
                                            />
                                        )}
                                        renderOption={(option) => {
                                            const matches = option.structured_formatting.main_text_matched_substrings;
                                            const parts = parse(
                                                option.structured_formatting.main_text,
                                                matches.map((match) => [match.offset, match.offset + match.length]),
                                            );

                                            return (
                                                <Grid container alignItems="center">
                                                    <Grid item>
                                                        <LocationOnIcon className={classes.icon} />
                                                    </Grid>
                                                    <Grid item xs>
                                                        {parts.map((part, index) => (
                                                            <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                                                                {part.text}
                                                            </span>
                                                        ))}

                                                        <Typography variant="body2" color="textSecondary">
                                                            {option.structured_formatting.secondary_text}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            );
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        {...bindAddressTwo}
                                        variant="outlined"
                                        name="addyTwo"
                                        fullWidth
                                        id="addyTwo"
                                        label="Address 2"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        {...bindNeighborhood}
                                        variant="outlined"
                                        name="neighborhood"
                                        fullWidth
                                        id="neighborhood"
                                        label="Neighborhood"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        {...bindCity}
                                        variant="outlined"
                                        name="city"
                                        required
                                        fullWidth
                                        id="city"
                                        label="City"
                                        autoComplete="address-level2"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        {...bindState}
                                        variant="outlined"
                                        name="password"
                                        required
                                        fullWidth
                                        label="State"
                                        autoComplete="state"
                                    />
                                </Grid>
                                <Grid item xs={12} sm={3}>
                                    <TextField
                                        {...bindZipcode}
                                        variant="outlined"
                                        name="zipcode"
                                        required
                                        fullWidth
                                        label="Zipcode"
                                        id="zipcode"
                                        autoComplete="postal-code"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={<Checkbox checked={lgbtq} onChange={() => setLgbtq(!lgbtq)} value="lgbtqFriendly" color="primary" />}
                                        label="LGBTQ Friendly 🏳️‍🌈"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox checked={accessibility} onChange={() => setAccessibility(!accessibility)} value="accesibilityFriendly" color="primary" />}
                                        label="Accesibility Friendly ♿"
                                    />
                                    <FormHelperText>Find out if your space is <Link target="_blank" href="https://www.tripadvisor.com/ShowTopic-g1-i12336-k4150249-Accessibility_Checklist_for_Hotel_Accommodation-Traveling_With_Disabilities.html"> accessibility friendly here.</Link></FormHelperText>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        {...bindAccesibilityInfo}
                                        variant="outlined"
                                        name="accessibilityInfo"
                                        required
                                        fullWidth
                                        multiline
                                        rows="4"
                                        label="Accessibility Info"
                                        id="accessibilityInfo"
                                        helperText="Is the room on the first floor? stairway access?"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        {...bindLivingSituation}
                                        variant="outlined"
                                        name="livingSituation"
                                        required
                                        fullWidth
                                        label="Living Situation"
                                        id="livingSituation"
                                        helperText="I.e. 'Living with my mom, 4 cats.'"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        {...bindDescription}
                                        variant="outlined"
                                        name="description"
                                        fullWidth
                                        multiline
                                        rows="4"
                                        label="Description"
                                        id="description"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        {...bindHousingRules}
                                        variant="outlined"
                                        name="housingRules"
                                        fullWidth
                                        multiline
                                        rows="4"
                                        label="Housing Rules"
                                        id="housingRules"
                                        helperText="I.e. 'Quiet hours @10pm, please do not eat the cat's tuna salad.'"
                                    />
                                </Grid>
                                <Grid item xs={12} className={classes.zone}>
                                    <DropzoneArea
                                        acceptedFiles={['image/jpg, image/png, image/jpeg']}
                                        filesLimit={4}
                                        onChange={handleFile}
                                        dropzoneClass={classes.zone}
                                        dropzoneText="Pictures of your space help users better identify it and are recommended."
                                    />
                                </Grid>
                            </Grid>
                            <Grid item xs={12} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    className={classes.submit}
                                >
                                    Create Listing
                    </Button>
                            </Grid>
                        </form>
                    </DialogContent>
                </Paper>
            </Dialog>
        </React.Fragment>
    )
}

export default withOktaAuth(CreateOffer);