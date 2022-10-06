require("dotenv").config();

import { Request, Response, NextFunction } from "express";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { LoginObject, UserObject } from "../interfaces/global";
import controllers from "../controllers";
import Utils from "../utils";

const googleClient = new OAuth2Client({
    clientId: `${process.env.OAUTH_CLIENTID}`,
});


interface MulterRequest extends Request { files: any; }
// Normal Auth
const userRegister = async (req: MulterRequest, res: Response) => {
    console.log(req.body)
    try {

        const { name, email, password, purchaser, address, yearsOwned, titledOwner,
            developed, treeType, contactName, city, state,
            contactNumber, creditRequired, businessType, role }: UserObject = req.body;

        if (!(email.trim() && password.trim() && name.trim())) {
            return res.status(400).send("Please enter all required data.");
        } // Check user

        const oldUser = await controllers.Auth.find({
            filter: { email: email.trim() },
        });

        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        let encryptedPassword = await bcrypt.hash(password, 10); // Encrypt password

        var imgFileName = "";
        var docFileName = "";

        if (req.files !== null) {
            const { landPlotImg, ownershipDoc } = req.files;
            if (landPlotImg) {
                for (let i = 0; i < landPlotImg.length; i++) {
                    const fileName1 = landPlotImg[i].name;
                    const fileHash2 = landPlotImg[i].md5;
                    const fileName3 = __dirname + "/../../uploads/" + fileHash2 + '.' + fileName1.slice(-3);
                    if (i == 0) {
                        imgFileName = fileName3;
                    }
                    else
                        imgFileName = imgFileName + "," + fileName3

                    landPlotImg[i].mv(fileName3, async (err: any) => {
                        if (err) {
                            console.log("Error: failed to download file.");
                            return res.status(500).send(err);
                        }
                    });
                }
            }
            if (ownershipDoc) {
                for (let i = 0; i < ownershipDoc.length; i++) {
                    const fileName11 = ownershipDoc[i].name;
                    const fileHash22 = ownershipDoc[i].md5;
                    const fileName3 = __dirname + "/../../uploads/" + fileHash22 + '.' + fileName11.slice(-3);
                    if (i == 0) {
                        docFileName = fileName3;
                    }
                    else
                        docFileName = docFileName + "," + fileName3
                    ownershipDoc[i].mv(fileName3, async (err: any) => {
                        if (err) {
                            console.log("Error: failed to download file.");
                            return res.status(500).send(err);
                        }
                    });
                }
            }
        }


        const result = await controllers.Auth.create({
            name: name,
            email: email.trim(),
            password: encryptedPassword,
            purchaser: purchaser,
            address: address,
            yearsOwned: yearsOwned,
            titledOwner: titledOwner,
            developed: developed,
            treeType: treeType,
            landPlotImage: imgFileName,
            ownershipDocument: docFileName,
            contactName: contactName,
            city: city,
            state: state,
            contactNumber: contactNumber,
            creditRequired: creditRequired,
            businessType: businessType,
            role: role,
            verify: false
        }); // Save user data

        let token = await controllers.Token.create({
            userId: result._id,
            token: crypto.randomBytes(32).toString("hex"),
        });

        const link = `${process.env.BASE_URL}api/user-verify/${result._id}/${token.token}`;
        // const sendVerify = await Utils.sendEmail(result.email, "New User Verify", link);

        // if (sendVerify) {
        res.status(200).json({
            success: true,
        });
        // } else {
        //     throw new Error("Server Error");
        // }
    } catch (err: any) {
        console.log("create error : ", err.message);
        res.status(500).send(err.message);
    }
};

const login = async (req: Request, res: Response) => {
    try {
        const { email, password }: LoginObject = req.body;

        if (!(email.trim() && password.trim())) {
            return res.status(400).send("Please Enter All Required Data.");
        }

        const user: any = await controllers.Auth.find({
            filter: { email: email.trim() },
        });
        if (!user) {
            // User check
            return res.status(404).send("User Not Exist. Please Registry");
        }


        const pass = await bcrypt.compare(password, user.password);

        if (pass) {
            if (!user.verify) {
                return res.status(403).send("User Not Verified. Please Verify");
            }
            // Password check
            const token = jwt.sign(
                { user_id: user._id, email: email.trim() },
                String(process.env.TOKEN_KEY),
                {
                    expiresIn: "2h",
                }
            ); // Create token

            res.status(200).json({ token: token });
        } else {
            return res.status(400).send("Password or Username Is Not Correct");
        }
    } catch (err: any) {
        console.log("login error: ", err);
        res.status(500).send(err.message);
    }
};

const passwordreset = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        const user = await controllers.Auth.find({ filter: { email: email } });
        if (!user)
            return res.status(400).send("User With Given Email Doesn't Exist");

        let token = await controllers.Token.find({
            filter: { userId: user._id },
        });

        if (!token) {
            token = await controllers.Token.create({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            });
        }

        const link = `${process.env.BASE_URL}api/reset/${user._id}/${token.token}`;
        const result = await Utils.sendEmail(user.email, "Password reset", link);

        if (result) {
            res.status(200).json({
                success: true
            });
        } else {
            throw new Error("Mailing Error");
        }
    } catch (err: any) {
        console.log(err);
        res.status(500).send(err.message);
    }
};

const handleverify = async (req: Request, res: Response) => {
    try {
        const user = await controllers.Auth.fintById({ param: req.params.userId });
        if (!user) return res.status(400).send("invalid link or expired");

        const token = await controllers.Token.find({
            filter: {
                userId: user._id,
                token: req.params.token,
            }
        });

        if (!token) return res.status(400).send("Invalid link or expired");

        user.verify = true;
        await user.save();
        await token.delete();

        res.redirect("http://localhost:3000");
    } catch (err: any) {
        console.log(err);
        res.status(500).send(err.message);
    }
}

const handlereset = async (req: Request, res: Response) => {
    try {
        const user = await controllers.Auth.fintById({ param: req.params.userId });
        if (!user) return res.status(400).send("invalid link or expired");

        const token = await controllers.Token.find({
            filter: {
                userId: user._id,
                token: req.params.token,
            }
        });

        if (!token) return res.status(400).send("Invalid link or expired");

        user.password = "";
        await user.save();
        await token.delete();

        res.redirect("http://localhost:3000");
    } catch (err: any) {
        console.log(err);
        res.status(500).send(err.message);
    }
}

// Middleware
const middleware = async (req: any, res: Response, next: NextFunction) => {
    try {
        const token = <string>req.headers["authorization"] || "";
        console.log(token);

        jwt.verify(
            token,
            String(process.env.TOKEN_KEY),
            async (err: any, userData: any) => {
                if (err) return res.status(403).end();

                const user: any = await controllers.Auth.find({
                    filter: {
                        email: userData.email,
                    },
                });
                req.user = user; // Save user data

                next();
            }
        );
    } catch (err: any) {
        console.log(err.message);
        res.status(401).end();
    }
};

export default {
    login,
    userRegister,
    passwordreset,
    handlereset,
    handleverify,
    middleware,
};
