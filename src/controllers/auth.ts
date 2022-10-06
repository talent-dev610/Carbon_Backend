import { UserSchema } from "../models";

const Auth = {
    create: async (props: any) => {
        const { name, email, password, purchaser, address, yearsOwned, titledOwner, developed, treeType, landPlotImage, ownershipDocument, contactName,
            city, state, contactNumber, creditRequired, businessType, role } = props;
        try {
            const newData = new UserSchema({
                name: name,
                email: email.toLowerCase().trim(),
                password: password,
                purchaser: purchaser,
                address: address,
                yearsOwned: yearsOwned,
                titledOwner: titledOwner,
                developed: developed,
                treeType: treeType,
                landPlotImage: landPlotImage,
                ownershipDocument: ownershipDocument,
                contactName: contactName,
                city: city,
                state: state,
                contactNumber: contactNumber,
                creditRequired: creditRequired,
                businessType: businessType,
                role: role,
                verify: false
            });

            const saveData = await newData.save();

            if (!saveData) {
                throw new Error("Database Error");
            }

            return saveData;
        } catch (err: any) {
            throw new Error(err.message);
        }
    },
    find: async (props: any) => {
        const { filter } = props;

        try {
            const result = await UserSchema.findOne(filter);
            return result;
        } catch (err: any) {
            throw new Error(err.message);
        }
    },
    fintById: async (props: any) => {
        const { param } = props;
        try {
            const result = await UserSchema.findById(param);

            return result;
        } catch (err: any) {
            throw new Error(err.message);
        }
    },
};

export default Auth;
