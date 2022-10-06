export interface UserObject {
    name: string;
    email: string;
    password: string;
    purchaser: string;
    address: string;
    yearsOwned: string;
    titledOwner: string;
    developed: boolean;
    treeType: string;
    landPlotImage: string;
    ownershipDocument: string;
    contactName: string;
    city: string;
    state: string;
    contactNumber: string;
    creditRequired: string;
    businessType: string;
    role: number;
}

export interface LoginObject {
    email: string;
    password: string;
}
