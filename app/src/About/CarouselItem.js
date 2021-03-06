import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Card } from '@material-ui/core'

const useStyles = makeStyles(theme => ({
    base: {
        padding: 15,
        height: 500,
        maxHeight: 500,
        maxWidth: '100%',
    },
    child: {
        height: '85%',
        overflow: 'auto',
    }
}));

export default function CarouselItem(props) {
    const classes = useStyles();
    return (
        <div>
            <Card elevation={0} className={classes.base}>
                <Typography color="primary" variant="h4">{props.title}</Typography>
                <hr/>
                <div className={classes.child}>
                    {props.children}
                </div>
            </Card>
        </div>
    )
}
