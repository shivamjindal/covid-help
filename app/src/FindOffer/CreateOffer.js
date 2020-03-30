import React, {useState} from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { Dialog, DialogTitle, DialogContent, Paper, Grid, TextField, Button, Typography, FormControlLabel, FormHelperText, Checkbox, Link } from '@material-ui/core';
import axios from 'axios';
import { useInput } from '../hooks/input-hook';

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
    }
}));
 
function CreateOffer(props) {
    const classes = useStyles();

    const [lgbtq, setLgbtq] = useState(false);
    const [accessibility, setAccessibility] = useState(false);

    const { value:listingName, bind:bindListingName, reset:resetListingName } = useInput('');
    const { value:addressOne, bind:bindAddressOne, reset:resetAddressOne } = useInput('');
    const { value:addressTwo, bind:bindAddressTwo, reset:resetAddressTwo } = useInput('');
    const { value:neighborhood, bind:bindNeighborhood, reset:resetNeighborhood } = useInput('');
    const { value:city, bind:bindCity, reset:resetCity } = useInput('');
    const { value:state, bind:bindState, reset:resetState } = useInput('');
    const { value:zipcode, bind:bindZipcode, reset:resetZipcode } = useInput('');
    const { value:accessibilityInfo, bind:bindAccesibilityInfo, reset: AccesibilityInfo} = useInput('');
    const { value:livingSituation, bind:bindLivingSituation, reset: resetLivingSituation} = useInput('');
    const { value:description, bind:bindDescription, reset: resetDescription} = useInput('');
    const { value:housingRules, bind:bindHousingRules, reset: resetHousingRules} = useInput('');

    // TODO: snackbar and check
    
    const handleSubmit = async(e) => {
        const accessToken = this.props.authState.accessToken;
        var config = {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Authorization': `Bearer ${accessToken}`,
            },
            params: {
                listingName: listingName,
                addressLineOne: addressOne,
                addressLineTwo: addressTwo,
                city: city,
                state: state,
                zipCode: zipcode,
                neighborhood: neighborhood,
                housingRules: housingRules,
                lgbtqpFriendly: lgbtq,
                accessibilityFriendly: accessibility,
                accesibilityInfo: accessibilityInfo,
                livingSituation: livingSituation,
            }
        };
        var self = this;
        e.preventDefault()
        axios.post(BASE_URL + '/createListing', config);
    };

    return (
        <React.Fragment>
            <Dialog
                open={props.open}
                onClose={() => props.handleClose()}
                aria-labelledby="alert-dialog-title" 
                style={{ minWidth:450 }}
            >
            <Paper className={classes.root}>
            <Link onClick={() => props.handleClose()} style={{float:"right"}} className={classes.closeDialog}>
                close
            </Link>
            <DialogTitle disableTypography={true} id="alert-dialog-title">
                <Typography variant="h5">
                    Add Listing
                </Typography>
            </DialogTitle>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2} style={{ paddingBottom:20 }}>
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
                            <TextField
                                {...bindAddressOne}
                                autoComplete="street-address"
                                name="addyOne"
                                variant="outlined"
                                required
                                fullWidth
                                id="addyOne"
                                label="Address 1"
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
                                control={<Checkbox checked={lgbtq} onChange={()=>setLgbtq(!lgbtq)} value="lgbtqFriendly" color="primary" />}
                                label="LGBTQ Friendly 🏳️‍🌈"
                            />
                            <FormControlLabel
                                control={<Checkbox checked={accessibility} onChange={()=>setAccessibility(!accessibility)} value="accesibilityFriendly" color="primary" />}
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
                                helper="I.e. 'Quiet hours @10pm, please do not eat the cat's filet mignon.'"
                            />
                        </Grid>
                    </Grid>
                    <Grid item xs={12} style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
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

export default CreateOffer