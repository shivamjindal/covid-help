var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var TYPES = require('tedious').TYPES;

require('dotenv').config()

var config = {
    server: 'covid19mutualaid.database.windows.net',
    authentication: {
        type: 'default',
        options: {
            userName: process.env.DB_USER,
            password: process.env.DB_PASS
        }
    },
    options: {
        encrypt: true,
        database: 'covid19mutualaid',
        useColumnNames: true,
    }
};

var connection;


function getUserID(email, callback) {
    connection = new Connection(config);

    var result = "";
    var code = 200

    sqlQuery = "SELECT userID FROM userTable WHERE orgEmail=@Email"

    request = new Request(sqlQuery, function (err, rowCount) {
        if (err) {
            console.error(err);
            result = "Internal Server Error"
            code = 500;
        }
        if (rowCount == 0) {
            console.error("User with email " + email + " was not Found")
            result = "User Not Found";
            code = 404;
        }
    });

    request.addParameter('Email', TYPES.VarChar, email);

    request.on('row', function (columns) {
        result = columns['userID'].value;
    });

    request.on('requestCompleted', function () {
        connection.close();
        if (code == 200) {
            callback(null, { result, code })
        }
        else if (code == 404) {
            callback(new Error("404 User not Found"), { result, code })
        }
        else {
            callback(new Error("500 Internal Server Error"), { result, code })
        }
    });

    request.on('error', (err) => {
        console.error(err);
        listingData = "Internal Server Error"
        code = 500;
    })

    connection.on('connect', function (err) {
        if (err) {
            connection.close();
            console.error("Error Connecting to DB")
            console.error(err)
            result = "Internal Server Error"
            code = 500
            callback(new Error("500 DB Connection Error"), { result, code })
        }
        else {
            console.log("/getUserID SQL DB Connected Successfully");
            connection.execSql(request);
        }
    });
}


function getSchoolListings(email, school, callback) {
    connection = new Connection(config);

    var result = []
    var code = 200;

    sqlQuery =
        "SELECT listingID, userTable.userID, \
        listingName, zipCode, prefEmail, grad_year, \
        city, lgbtqpFriendly, accessibilityFriendly, state\
        FROM listingTable JOIN userTable \
        ON (listingTable.userID = userTable.userID) \
        WHERE disabledAcct = 0 AND orgEmail!=@Email AND org=@School AND disabledListing!=1";

    request = new Request(sqlQuery, function (err, rowCount) {

        if (err) {
            console.error(err);
            result = "Internal Server Error"
            code = 500;
        }
    });

    request.addParameter('School', TYPES.VarChar, school);
    request.addParameter('Email', TYPES.VarChar, email);


    request.on('row', function (columns) {
        listing = {}
        for (var name in columns) {
            listing[name] = columns[name].value
        }
        result.push(listing)
    });

    request.on('requestCompleted', function () {
        connection.close();
        if (code == 200) {
            callback(null, { result, code })
        }
        else if (code == 404) {
            callback(new Error("404 User not Found"), { result, code })
        }
        else {
            callback(new Error("500 Internal Server Error"), { result, code })
        }
    });

    request.on('error', (err) => {
        console.error(err);
        listingData = "Internal Server Error"
        code = 500;
    })


    connection.on('connect', function (err) {
        if (err) {
            connection.close();
            console.error("Error Connecting to DB")
            console.error(err)
            result = "Internal Server Error"
            code = 500
            callback(new Error("500 DB Connection Error"), { result, code })
        }
        else {
            console.log("/getListings SQL DB Connected Successfully");
            connection.execSql(request);
        }
    });
}


function getUsersListings(email, school, callback) {
    connection = new Connection(config);
    var result = []
    var code = 200;

    sqlQuery =
        "SELECT listingID, userTable.userID, \
        listingName, zipCode, prefEmail, grad_year, \
        city,lgbtqpFriendly, accessibilityFriendly, state, disabledListing\
        FROM listingTable JOIN userTable \
        ON (listingTable.userID = userTable.userID) \
        WHERE disabledAcct = 0 AND orgEmail=@Email AND org=@School";

    request = new Request(sqlQuery, function (err, rowCount) {
        if (err) {
            console.error(err);
            result = "Internal Server Error"
            code = 500;
        }
    });

    request.addParameter('School', TYPES.VarChar, school);
    request.addParameter('Email', TYPES.VarChar, email);


    request.on('row', function (columns) {
        listing = {}
        for (var name in columns) {
            listing[name] = columns[name].value
        }
        result.push(listing)
    });

    request.on('requestCompleted', function () {
        connection.close();
        if (code == 200) {
            callback(null, { result, code })
        }
        else if (code == 404) {
            callback(new Error("404 User not Found"), { result, code })
        }
        else {
            callback(new Error("500 Internal Server Error"), { result, code })
        }
    });

    request.on('error', (err) => {
        console.error(err);
        listingData = "Internal Server Error"
        code = 500;
    })

    connection.on('connect', function (err) {
        if (err) {
            connection.close();
            console.error("/getUsersListings Error Connecting to DB")
            console.error(err)
            result = "Internal Server Error"
            code = 500
            callback(new Error("500 DB Connection Error"), { result, code })
        }
        else {
            console.log("/getUsersListings SQL DB Connected Successfully");
            connection.execSql(request);
        }
    });
}

function getUser(email, callback) {
    connection = new Connection(config);
    var result = [];
    var code = 200;

    sqlQuery =
        "SELECT * \
        FROM userTable \
        WHERE userTable.orgEmail = @email"

    request = new Request(sqlQuery, function (err, rowCount) {
        if (err) {
            console.error(err);
            result = "Internal Server E　rror"
            code = 500;
        } else if (rowCount == 0) {
            console.log(rowCount)
            code = 404;
            result = "User Not Found"
        }
    });

    request.addParameter('email', TYPES.VarChar, email);

    request.on('row', function (columns) {
        listing = {}
        for (var name in columns) {
            listing[name] = columns[name].value
        }
        result.push(listing)
    });



    request.on('requestCompleted', function () {
        connection.close();
        if (code == 200) {
            callback(null, { result, code })
        }
        else if (code == 404) {
            callback(new Error("404 User not Found"), { result, code })
        }
        else {
            callback(new Error("500 Internal Server Error"), { result, code })
        }
    });

    request.on('error', (err) => {
        console.error("/getUser", err);
        result = "Internal Server Error"
        code = 500;
    })

    connection.on('connect', function (err) {
        if (err) {
            connection.close();
            console.error("Error Connecting to DB")
            console.error(err)
            result = "Internal Server Error"
            code = 500
            callback(new Error("500 DB Connection Error"), { result, code })
        }
        else {
            console.log("/getUser SQL DB Connected Successfully");
            connection.execSql(request);
        }
    });
}

function getListerID(listingID, callback) {
    connection = new Connection(config);
    var result = "";
    var code = 200

    sqlQuery = "SELECT userID FROM listingTable WHERE \
            listingTable.listingID = @ListingID;"

    request = new Request(sqlQuery, function (err, rowCount) {
        if (err) {
            console.error(err);
            result = "Internal Server Error"
            code = 500;
        }
        if (rowCount == 0) {
            console.error("User associated with " + listingID + " not Found")
            result = "User Not Found";
            code = 404;
        }
    });

    request.addParameter('ListingID', TYPES.Int, listingID);

    request.on('row', function (columns) {
        result = columns['userID'].value;
    });

    request.on('requestCompleted', function () {
        connection.close();
        if (code == 404) {
            callback(new Error("User Not Found"), { result, code })
        }
        else if (code == 500) {
            callback(new Error("Internal Server Error"), { result, code })
        }
        callback(null, { result, code })
    });

    request.on('error', (err) => {
        console.error(err);
        result = "Internal Server Error"
        code = 500;
    })

    connection.on('connect', function (err) {
        if (err) {
            console.error(err);
            result = "Internal Server Error"
            code = 500;
        }
        else {
            console.log("/getListerID Connected Successfully");
            connection.execSql(request);
        }
    });

}

function getListing(email, listing, school, callback) {
    connection = new Connection(config);
    var result = []
    var code = 200;

    sqlQuery =
        "SELECT * \
        FROM listingTable JOIN userTable \
        ON (listingTable.userID = userTable.userID) \
        WHERE listingTable.listingID = @ListingID AND org=@School;"

    request = new Request(sqlQuery, function (err, rowCount) {
        if (err) {
            console.error(err);
            result = "Internal Server Error"
            code = 500;
        }
        if (rowCount === 0) {
            result = "Listing Not Found"
            code = 404;
            console.error(email + " attempted access for listingID=" + listing + " with school=" + school + " but Listing not found");
        }
    });

    request.addParameter('ListingID', TYPES.Int, listing);
    request.addParameter('School', TYPES.VarChar, school);

    request.on('row', function (columns) {
        listing = {}
        for (var name in columns) {
            listing[name] = columns[name].value
        }

        result.push(listing)
    });

    request.on('requestCompleted', function () {
        connection.close();
        if (code == 200) {
            callback(null, { result, code })
        }
        else if (code == 404) {
            callback(new Error("404 User not Found"), { result, code })
        }
        else {
            callback(new Error("500 Internal Server Error"), { result, code })
        }

    });

    request.on('error', (err) => {
        console.error(err);
        result = "Internal Server Error"
        code = 500;
    })

    connection.on('connect', function (err) {
        if (err) {
            console.err(err);
            connection.close();
            result = "DB Connection Error"
            code = 500
            callback(new Error("Connection Error"), { result, code })
        }
        else {
            console.log("/getListing SQL DB Connected Successfully");
            connection.execSql(request);
        }
    });
}


function createListing(listingInfo, callback) {
    connection = new Connection(config);
    code = 200;
    var result = [];

    sqlQuery =
        "INSERT INTO listingTable \
            (userID, addressLineOne, addressLineTwo, \
            city, state, zipCode, neighborhood, housingRules, \
            lgbtqpFriendly, accessibilityFriendly, \
            accessbilityInfo, listingName, livingSituation, housingInfo, disabledListing)\
        VALUES(\
            @UserID, @AddressLineOne, @AddressLineTwo, @City, \
            @State, @ZipCode, @Neighborhood, @HousingRules, \
            @LGBTQPFRD, @ACCESSFRD, @AccessInfo, @ListingName, \
            @LivingSituation, @HousingInfo, 0);\
        SELECT @@identity"

    request = new Request(sqlQuery, function (err, rowCount) {
        if (err) {
            console.error(err);
            result = "Internal Server Error"
            code = 500;
        }
    });

    request.addParameter('UserID', TYPES.Int, listingInfo.userID);
    request.addParameter('AddressLineOne', TYPES.VarChar, listingInfo.addressLineOne);
    request.addParameter('AddressLineTwo', TYPES.VarChar, listingInfo.addressLineTwo);
    request.addParameter('City', TYPES.VarChar, listingInfo.city);
    request.addParameter('State', TYPES.VarChar, listingInfo.state);
    request.addParameter('ZipCode', TYPES.Int, listingInfo.zipCode);
    request.addParameter('Neighborhood', TYPES.VarChar, listingInfo.neighborhood);
    request.addParameter('HousingRules', TYPES.VarChar, listingInfo.housingRules);
    request.addParameter('LGBTQPFRD', TYPES.Bit, listingInfo.lgbtqpFriendly);
    request.addParameter('ACCESSFRD', TYPES.Bit, listingInfo.accessibilityFriendly);
    request.addParameter('AccessInfo', TYPES.VarChar, listingInfo.accessibilityInfo);
    request.addParameter('ListingName', TYPES.VarChar, listingInfo.listingName);
    request.addParameter('LivingSituation', TYPES.VarChar, listingInfo.livingSituation);
    request.addParameter('HousingInfo', TYPES.VarChar, listingInfo.housingInfo);

    request.on('row', function (columns) {
        listing = {}
        for (var name in columns) {
            listing[name] = columns[name].value
        }
        console.log(listing);
        result.push(listing)
    });

    request.on('requestCompleted', function () {
        connection.close();
        if (code == 200) {
            callback(null, { result, code })
        }
        else if (code == 404) {
            callback(new Error("404 User not Found"), { result, code })
        }
        else {
            callback(new Error("500 Internal Server Error"), { result, code })
        }
    });


    request.on('error', (err) => {
        console.error(err);
        result = "Internal Server Error"
        code = 500;
    })

    connection.on('connect', function (err) {
        if (err) {
            connection.close();
            console.error("Error Connecting to DB")
            console.error(err)
            result = "Internal Server Error"
            code = 500
            callback(new Error("500 DB Connection Error"), { result, code })
        }
        else {
            console.log("/createListing SQL DB Connected Successfully");
            connection.execSql(request);
        }

    });
}


function createListingHandler(email, listingInfo, callback) {
    status = 200
    getUserID(email, (userID, userIDstatus) => {
        if (userIDstatus != 200) {
            callback(userID, userIDstatus)
        } else {
            console.log('userID')
            listingInfo['userID'] = userID;
            console.log(listingInfo)
            createListing(listingInfo, (successMsg, status) => {
                if (status == 200) {
                    callback(successMsg, 200)
                }
                else {
                    callback("Error updating user", 500);
                }
            })
        }
    })
}

function updateUser(userInfo, callback) {
    connection = new Connection(config);
    var result = "";
    var code = 200;


    sqlQuery =
        "UPDATE userTable \
        SET firstName = @FirstName, lastName = @LastName,\
        orgEmail = @OrgEmail, prefEmail = @PrefEmail, phoneNumber = @Phone,\
        Facebook = @FacebookLink, LinkedIn = @LinkedInLink, Instagram = @InstagramLink, preferredContactMethod = @PrefContact, \
        org = @Org, gender = @Gender, ethnicity = @Ethnicity, grad_year = @GradYear, \
        preferred_pronouns = @PrefPronoun, bio = @Bio\
        WHERE userID = @UserID"

    request = new Request(sqlQuery, function (err, rowCount) {
        if (err) {
            console.error(err);
            result = "Internal Server Error"
            code = 500;
        }
    });

    request.addParameter('UserId', TYPES.VarChar, userInfo.userID)
    request.addParameter('FirstName', TYPES.VarChar, userInfo.firstName);
    request.addParameter('LastName', TYPES.VarChar, userInfo.lastName);
    request.addParameter('OrgEmail', TYPES.VarChar, userInfo.orgEmail);
    request.addParameter('PrefEmail', TYPES.VarChar, userInfo.prefEmail);
    request.addParameter('Phone', TYPES.VarChar, userInfo.phoneNumber);
    request.addParameter('FacebookLink', TYPES.VarChar, userInfo.Facebook);
    request.addParameter('LinkedInLink', TYPES.VarChar, userInfo.LinkedIn);
    request.addParameter('InstagramLink', TYPES.VarChar, userInfo.Instagram);
    request.addParameter('PrefContact', TYPES.VarChar, userInfo.preferredContactMethod);
    request.addParameter('Org', TYPES.VarChar, userInfo.org);
    request.addParameter('Gender', TYPES.VarChar, userInfo.gender);
    request.addParameter('Ethnicity', TYPES.VarChar, userInfo.ethnicity);
    request.addParameter('GradYear', TYPES.VarChar, userInfo.grad_year);
    request.addParameter('PrefPronoun', TYPES.VarChar, userInfo.preferred_pronouns)
    request.addParameter('Bio', TYPES.VarChar, userInfo.bio)

    request.on('requestCompleted', function () {
        connection.close();
        if (code == 200) {
            callback(null, { result, code })
        }
        else if (code == 404) {
            callback(new Error("404 User not Found"), { result, code })
        }
        else {
            callback(new Error("500 Internal Server Error"), { result, code })
        }
    });

    request.on('error', (err) => {
        console.error(err);
        result = "Internal Server Error"
        code = 500;
    })

    connection.on('connect', function (err) {
        if (err) {
            connection.close();
            console.error("Error Connecting to DB")
            console.error(err)
            result = "Internal Server Error"
            code = 500
            callback(new Error("500 DB Connection Error"), { result, code })
        }
        else {
            console.log("/updateUser SQL DB Connected Successfully");
            connection.execSql(request);
        }

    });

}


function createUser(userInfo, callback) {
    connection = new Connection(config);
    var result = ""
    code = 200;

    sqlQuery =
        "INSERT INTO userTable \
            (firstName, lastName, orgEmail, prefEmail, phoneNumber, \
            Facebook, LinkedIn, Instagram, preferredContactMethod, \
            disabledAcct, org, gender, ethnicity, grad_year)\
        VALUES(@FirstName, @LastName, @OrgEmail, @PrefEmail, @Phone, @FacebookLink, \
            @LinkedInLink, @InstagramLink, @PrefContact, 0, \
            @ORG, @Gender, @Ethnicity, @GradYear);"

    request = new Request(sqlQuery, function (err, rowCount) {
        if (err) {
            console.error(err);
            result = "Internal Server Error"
            code = 500;
        }
    });

    request.addParameter('FirstName', TYPES.VarChar, userInfo.firstName);
    request.addParameter('LastName', TYPES.VarChar, userInfo.lastName);
    request.addParameter('OrgEmail', TYPES.VarChar, userInfo.orgEmail);
    request.addParameter('PrefEmail', TYPES.VarChar, userInfo.prefEmail);
    request.addParameter('Phone', TYPES.VarChar, userInfo.phoneNumber);
    request.addParameter('FacebookLink', TYPES.VarChar, userInfo.Facebook);
    request.addParameter('LinkedInLink', TYPES.VarChar, userInfo.LinkedIn);
    request.addParameter('InstagramLink', TYPES.VarChar, userInfo.Instagram);
    request.addParameter('PrefContact', TYPES.VarChar, userInfo.preferredContactMethod);
    request.addParameter('ORG', TYPES.VarChar, userInfo.org);
    request.addParameter('Gender', TYPES.VarChar, userInfo.gender);
    request.addParameter('Ethnicity', TYPES.VarChar, userInfo.ethnicity);
    request.addParameter('GradYear', TYPES.VarChar, userInfo.grad_year);

    request.on('requestCompleted', function () {
        connection.close();
        if (code == 200) {
            callback(null, { result, code })
        }
        else if (code == 404) {
            callback(new Error("404 User not Found"), { result, code })
        }
        else {
            callback(new Error("500 Internal Server Error"), { result, code })
        }
    });

    request.on('error', (err) => {
        console.error(err);
        result = "Internal Server Error"
        code = 500;
    })

    connection.on('connect', function (err) {
        if (err) {
            connection.close();
            console.error("Error Connecting to DB")
            console.error(err)
            result = "Internal Server Error"
            code = 500
            callback(new Error("500 DB Connection Error"), { result, code })
        }
        else {
            console.log("/createUser SQL DB Connected Successfully");
            connection.execSql(request);
        }

    });
}


function disableListing(listingID, userEmail, callback) {
    connection = new Connection(config);
    code = 200;
    var result = ""

    sqlQuery =
        "UPDATE listingTable \
        SET disabledListing=1 \
        WHERE listingID=@ListingID\
        AND userID in ( \
            SELECT userID \
            FROM userTable \
            WHERE orgEmail=@OrgEmail);"

    request = new Request(sqlQuery, function (err, rowCount) {
        if (err) {
            console.error(err);
            result = "Internal Server Error"
            code = 500;
        }
    });

    request.addParameter('ListingID', TYPES.Int, listingID)
    request.addParameter('OrgEmail', TYPES.VarChar, userEmail)

    request.on('requestCompleted', function () {
        connection.close();
        if (code == 200) {
            callback(null, { result, code })
        }
        else if (code == 404) {
            callback(new Error("404 User not Found"), { result, code })
        }
        else {
            callback(new Error("500 Internal Server Error"), { result, code })
        }
    });

    request.on('error', (err) => {
        console.error(err);
        result = "Internal Server Error"
        code = 500;
    })

    connection.on('connect', function (err) {
        if (err) {
            connection.close();
            console.error("Error Connecting to DB")
            console.error(err)
            result = "Internal Server Error"
            code = 500
            callback(new Error("500 DB Connection Error"), { result, code })
        }
        else {
            console.log("/disableListing SQL DB Connected Successfully");
            connection.execSql(request);
        }
    });
}

function enableListing(listingID, userEmail, callback) {
    connection = new Connection(config);
    code = 200;

    sqlQuery =
        "UPDATE listingTable \
        SET disabledListing = 0 \
        WHERE listingID=@ListingID\
        AND userID in ( \
            SELECT userID \
            FROM userTable \
            WHERE orgEmail=@OrgEmail);"

    request = new Request(sqlQuery, function (err, rowCount) {
        if (err) {
            console.error(err);
            result = "Internal Server Error"
            code = 500;
        }
    });

    request.addParameter('ListingID', TYPES.Int, listingID)
    request.addParameter('OrgEmail', TYPES.VarChar, userEmail)

    request.on('requestCompleted', function () {
        connection.close();
        if (code == 200) {
            callback(null, { result, code })
        }
        else if (code == 404) {
            callback(new Error("404 User not Found"), { result, code })
        }
        else {
            callback(new Error("500 Internal Server Error"), { result, code })
        }
    });

    request.on('error', (err) => {
        console.error(err);
        result = "Internal Server Error"
        code = 500;
    })

    connection.on('connect', function (err) {
        if (err) {
            connection.close();
            console.error("Error Connecting to DB")
            console.error(err)
            result = "Internal Server Error"
            code = 500
            callback(new Error("500 DB Connection Error"), { result, code })
        }
        else {
            console.log("/enableListing SQL DB Connected Successfully");
            connection.execSql(request);
        }
    });
}

function deleteListing(listingID, userEmail, callback) {
    connection = new Connection(config);
    code = 200;
    var result = ""

    sqlQuery =
        "DELETE FROM listingTable \
        WHERE listingID=@ListingID \
        AND userID in (\
            SELECT userID \
            FROM userTable \
            WHERE orgEmail=@OrgEmail);"

    request = new Request(sqlQuery, function (err, rowCount) {
        if (err) {
            console.error(err);
            result = "Internal Server Error"
            code = 500;
        }
    });

    request.addParameter('ListingID', TYPES.Int, listingID)
    request.addParameter('OrgEmail', TYPES.VarChar, userEmail)


    request.on('requestCompleted', function () {
        connection.close();
        if (code == 200) {
            callback(null, { result, code })
        }
        else if (code == 404) {
            callback(new Error("404 User not Found"), { result, code })
        }
        else {
            callback(new Error("500 Internal Server Error"), { result, code })
        }
    });

    request.on('error', (err) => {
        console.error(err);
        result = "Internal Server Error"
        code = 500;
    })

    connection.on('connect', function (err) {
        if (err) {
            connection.close();
            console.error("Error Connecting to DB")
            console.error(err)
            result = "Internal Server Error"
            code = 500
            callback(new Error("500 DB Connection Error"), { result, code })
        }
        else {
            console.log("/deleteListing SQL DB Connected Successfully");
            connection.execSql(request);
        }
    });
}

module.exports = {
    getSchoolListings, getUsersListings,
    getListing, createListingHandler, createListing,
    createUser, getUser, updateUser,
    disableListing, deleteListing, enableListing, getListerID, getUserID
}
