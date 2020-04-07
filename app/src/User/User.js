import React, {useState, useRef} from 'react'
import NavBar from '../NavBar.js'
import InlineEdit from './InlineEdit.js'
import axios from 'axios'
import { withOktaAuth } from '@okta/okta-react';
import MuiAlert from '@material-ui/lab/Alert';
import { Grid, Paper, Avatar, Typography, Divider, List, ListItem, Link, Snackbar, IconButton, Tooltip, CircularProgress } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Prompt } from 'react-router'
import bgImage from '../img/house.jpg'
import _ from 'lodash'
import sanitizeHtml from 'sanitize-html-react'
import FormData from 'form-data'
const fs = require("fs");
const path = require("path");

const BASE_URL = 'http://localhost:8080'

const useStyles = makeStyles(theme => ({
    root: {
        background: `url(${bgImage}) no-repeat center center fixed`,
        opacity: 0.9,
        backgroundSize: 'cover',
        minHeight: '100vh',
        padding: 30
    },
    section: {
        marginTop: 15,
    },
    text: {
        color: "gray",
        fontWeight: 300,
    },
    listItem: {
        paddingBottom: "20px!important",
    },
    divider: {
        height: 10
    },
    title: {
        paddingBottom: 2.5
    },
    edit: {
        float: 'right',
        "&:hover": {
            color: 'gray!important',
            textDecoration: 'underline!important'
        }
    },
    save: {
        float: 'right',
        color: '#F08080!important',
        "&:hover": {
            color: 'LightGreen!important',
            textDecoration: 'underline!important'
        }
    },
    cancel: {
        float: 'right',
        marginLeft: 10,
        color: 'gray!important',
        "&:hover": {
            color: '#F08080!important',
            textDecoration: 'underline!important'
        }
    },
    editSection: {
        marginBottom: '20px!important'
    },
    input: {
        display: 'none',
    },
}));

// styling for just the tooltip
const useStylesBootstrap = makeStyles((theme) => ({
    arrow: {
      color: theme.palette.common.black,
    },
    tooltip: {
      backgroundColor: theme.palette.common.black,
    },
  }));

function BootstrapTooltip(props) {
    const classes = useStylesBootstrap();
    return <Tooltip arrow classes={classes} {...props} placement="top"/>;
  }

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function User(props) {
    const classes = useStyles();
    // refs for the contact information
    const prefEmail = useRef('')
    const setPrefEmail = (newVal) => {
        prefEmail.current = sanitizeHtml(newVal, {allowedTags: [],
            allowedAttributes: []})
        // console.log("newPrefEmail: ", prefEmail.current)
    }
    const phoneNumber = useRef('')
    const setPhoneNumber = (newVal) => {
        phoneNumber.current = sanitizeHtml(newVal, {allowedTags: [],
            allowedAttributes: []})
        //  console.log("newPhoneNumber: ", phoneNumber.current)
    }
    const preferredContactMethod = useRef('')
    const setPreferredContactMethod = (newVal) => {
        preferredContactMethod.current = sanitizeHtml(newVal, {allowedTags: [],
            allowedAttributes: []})
        // console.log("newContactMethod: ", preferredContactMethod.current)
    }

    // refs for the basic information
    const gender = useRef('')
    const setGender = (newVal) => {
        gender.current = sanitizeHtml(newVal, {allowedTags: [],
            allowedAttributes: []})
        // console.log('newGender: ', gender.current)
    }
    const ethnicity = useRef('')
    const setEthnicity = (newVal) => {
        ethnicity.current = sanitizeHtml(newVal, {allowedTags: [],
            allowedAttributes: []})
        // console.log('newEthnicity: ', ethnicity.current)
    }
    const pp = useRef('')
    const setPp = (newVal) => {
        pp.current = sanitizeHtml(newVal, {allowedTags: [],
            allowedAttributes: []})
        // console.log('newPp: ', pp.current)
    }

    // ref for bio
    const bio = useRef('')
    const setBio = (newVal) => {
        bio.current = sanitizeHtml(newVal, {allowedTags: [],
            allowedAttributes: []})
        // console.log('newBio: ', bio.current);
    }

    // refs for socials
    const fb = useRef('')
    const setFb = (newVal) => {
        fb.current = sanitizeHtml(newVal, {allowedTags: [],
            allowedAttributes: []})
        // console.log('newFB: ', fb.current)
    }
    const ig = useRef('')
    const setIg = (newVal) => {
        ig.current = sanitizeHtml(newVal, {allowedTags: [],
            allowedAttributes: []})
        // console.log('newIG: ', ig.current)
    }
    const li = useRef('')
    const setLi = (newVal) => {
        li.current = sanitizeHtml(newVal, {allowedTags: [],
            allowedAttributes: []})
        // console.log('newLI: ', li.current)
    }

    // state for disabling account: TODO
    const [disabledAct, setDisabledAct] = useState('')

    const [user, setUser] = useState({});
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [profilePhotoURL, setProfilePhotoURL] = useState('');
    const [editDisabled, setEditDisabled] = useState(true);
    const [snackBar, setSnackBar] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState({severity:'success', message:'successfully updated profile!'})

    const accessToken = props.authState.accessToken;
    React.useEffect(() => {
        let config = {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Authorization': `Bearer ${accessToken}`,
            }
        };
        axios.get(BASE_URL + '/getUser', config)
            .then(function (response) {
                if(_.isEqual(response.data[0], user)){
                    return;
                }
                setUser({...response.data[0]});
                //set our refs
                setPrefEmail(response.data[0].prefEmail)
                setPhoneNumber(response.data[0].phoneNumber)
                setPreferredContactMethod(response.data[0].preferredContactMethod)
                setEthnicity(response.data[0].ethnicity)
                setGender(response.data[0].gender)
                setPp(response.data[0].preferred_pronouns)
                setBio(response.data[0].bio)
                setFb(response.data[0].Facebook)
                setIg(response.data[0].Instagram)
                setLi(response.data[0].LinkedIn)
            })
            .catch(function (error) {
                console.log(error);
            });
    }, [user, editDisabled, profilePhoto, profilePhotoURL]);

    const saveChanges = async() => {
        const accessToken = props.authState.accessToken;
        var data = {
            userInfo: {
                userID: user.userID,
                firstName: user.firstName,
                lastName: user.lastName,
                org: user.org,
                grad_year: user.grad_year,
                disabledAcct: user.disabledAcct,
                orgEmail: user.orgEmail,
                prefEmail: prefEmail.current,
                phoneNumber: phoneNumber.current,
                preferredContactMethod: preferredContactMethod.current,
                gender: gender.current,
                ethnicity: ethnicity.current,
                preferred_pronouns: pp.current,
                bio: bio.current,
                LinkedIn: li.current,
                Facebook: fb.current,
                Instagram: ig.current,
            }
        };
        console.log(data);
        var config = {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Authorization': `Bearer ${accessToken}`,
            },
        };
        var self = this;
        axios.post(BASE_URL + '/updateUser', data, config)
            .then(function (response) {
                console.log(response)
                setEditDisabled(!editDisabled)
                setSnackBar(true);
                setSnackBarMessage({severity: 'success', message: 'Successfully updated profile!'})
            })
            .catch(function (error) {
                console.log(error)
                setSnackBar(true);
                setSnackBarMessage({severity: 'error', message: 'Unable to update profile, please try again.'})
        });
    }

    const onProfilePhotoChange = async(e) =>{
        let image = e.target.files[0];
        let imageURL = URL.createObjectURL(e.target.files[0])
        console.log('image file: ', image);
        console.log('image url: ', image.name);
        
        if(!image){ // catch all non uploads
            return;
        }
        setProfilePhoto(image);
        setProfilePhotoURL(imageURL);
        console.log('image file: ', image);
        console.log('image url: ', image.name);
        
        const accessToken = props.authState.accessToken;
        console.log("new profile photo: ", profilePhoto);
        const fd = new FormData();
        fd.append('stream', image);

        console.log("form data: ", fd.get('stream'));
        
        const config = {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Authorization': `Bearer ${accessToken}`,
                'accept': 'application/json',
                'Accept-Language': 'en-US,en;q=0.8',
                'Content-Type': `multipart/form-data; boundary=${fd._boundary}`,
            },
        };
        var self = this;
        axios.post(BASE_URL + '/updateProfilePhoto', fd, config)
            .then(function (response) {
                setSnackBar(true);
                setSnackBarMessage({severity: 'success', message: 'Succesfully updated profile!'});
            })
            .catch(function (error) {
                console.log(error);
                setSnackBar(true);
                setSnackBarMessage({severity: 'error', message: 'Unable to update profile.'});                
            });
    }

    var school = user.org ? user.org.toUpperCase() : '';

    const cancelButton = editDisabled ? '' : <Link className={classes.cancel} onClick={() => setEditDisabled(!editDisabled)}><Typography variant='inherit'>Cancel</Typography></Link>

    return (
        <div>
            <Prompt
                when={!editDisabled}
                message='You have unsaved changes, are you sure you want to leave?'
            />
            <NavBar></NavBar>
            <Grid
                className={classes.root}
                container
                spacing={2}
                alignItems="center"
                justify="center" >
                <Grid item>
                    <Paper style={{ paddingRight: 50, paddingLeft: 50, paddingTop: 25, paddingBottom: 25 }}>
                        {user.userID ? (
                        <Grid container direction="column" alignItems="center">
                            <Grid item sm={12} className={classes.section}>
                                <input type="file" accept="image/jpg,image/png,image/jpeg" className={classes.input} id="icon-button-file" onChange={onProfilePhotoChange}/>
                                    <BootstrapTooltip title="Update profile photo" aria-label="Update profile photo">
                                    <label htmlFor="icon-button-file">
                                        <IconButton component="span">
                                            <Avatar style={{ height: 150, width: 150 }} src={profilePhotoURL}></Avatar>
                                        </IconButton>
                                    </label>
                                    </BootstrapTooltip>
                            </Grid>
                            <Grid item sm={12} className={classes.section}>
                                <Typography variant="h4">{user.firstName + " " + user.lastName}</Typography>
                            </Grid>
                            <Grid item sm={12} style={{ marginTop: 5 }}>
                                <Typography className={classes.text} variant="body1">{school + " // " + user.grad_year}</Typography>
                            </Grid>
                            <Grid item sm={12} className={classes.section} style={{ maxWidth: 600 }}>
                                <List>
                                    <ListItem className={classes.editSection} style={{ display: 'block' }}>
                                        {cancelButton}
                                        <Link className={editDisabled ? classes.edit : classes.save} onClick={!editDisabled ? () => saveChanges() : () => setEditDisabled(!editDisabled)}><Typography variant='inherit'>{editDisabled ? 'Edit' : 'Save'}</Typography></Link>
                                    </ListItem>
                                    <Divider />
                                    <ListItem className={classes.listItem} style={{ display: 'block' }}>
                                        <div className={classes.title}>
                                            <Typography align="left" color="primary" variant="h5">Contact Information</Typography>
                                        </div>
                                        <InlineEdit disabled={true} label="School Email:" defaultInput={user.orgEmail}></InlineEdit>
                                        <InlineEdit disabled={editDisabled} label="Preferred Email:" defaultInput={user.prefEmail} onChange={setPrefEmail}></InlineEdit>
                                        <InlineEdit disabled={editDisabled} label="Phone Number:" defaultInput={user.phoneNumber} onChange={setPhoneNumber}></InlineEdit>
                                        <InlineEdit disabled={editDisabled} label="Preferred Contact Method:" defaultInput={user.preferredContactMethod} onChange={setPreferredContactMethod}></InlineEdit>
                                    </ListItem>
                                    <div className={classes.divider}></div>
                                    <Divider />
                                    <ListItem className={classes.listItem} style={{ display: 'block' }}>
                                        <div className={classes.title}>
                                            <Typography color="primary" variant="h5">Basic Information</Typography>
                                        </div>
                                        <InlineEdit disabled={editDisabled} label="Ethnicity:" defaultInput={user.ethnicity} onChange={setEthnicity}></InlineEdit>
                                        <InlineEdit disabled={editDisabled} label="Gender:" defaultInput={user.gender} onChange={setGender}></InlineEdit>
                                        <InlineEdit disabled={editDisabled} label="Preferred Pronouns:" defaultInput={user.preferred_pronouns} onChange={setPp}></InlineEdit>
                                    </ListItem>
                                    <div className={classes.divider}></div>
                                    <Divider />
                                    <ListItem className={classes.listItem} style={{ display: 'block' }}>
                                        <div className={classes.title}>
                                            <Typography color="primary" variant="h5">Bio</Typography>
                                        </div>
                                        <InlineEdit disabled={editDisabled} defaultInput={user.bio} onChange={setBio}></InlineEdit>
                                    </ListItem>
                                    <div className={classes.divider}></div>
                                    <Divider />
                                    <ListItem className={classes.listItem} style={{ display: 'block' }}>
                                        <div className={classes.title}>
                                            <Typography color="primary" variant="h5">Social Media</Typography>
                                        </div>
                                        <InlineEdit disabled={editDisabled} label="Facebook URL:" defaultInput={user.Facebook} onChange={setFb}></InlineEdit>
                                        <InlineEdit disabled={editDisabled} label="Instagram URL:" defaultInput={user.Instagram} onChange={setIg}></InlineEdit>
                                        <InlineEdit disabled={editDisabled} label="LinkedIn URL:" defaultInput={user.LinkedIn} onChange={setLi}></InlineEdit>
                                    </ListItem>
                                </List>
                            </Grid>
                        </Grid>
                        ) : <div style={{textAlign:"center"}}><CircularProgress size={75}/><div><Typography variant="h5">Loading...</Typography></div></div>}
                    </Paper>
                </Grid>

            </Grid>
            <Snackbar open={snackBar} autoHideDuration={6000} onClose={() => setSnackBar(false)}>
                <Alert onClose={() => setSnackBar(false)} severity={snackBarMessage.severity}>
                    {snackBarMessage.message}
                </Alert>
            </Snackbar>
        </div>
    )
}

export default withOktaAuth(User)