export type School = {
    urn: string;
    lsoa_id: string;
    school_name: string;
    postcode: string;
    is_primary: boolean;
    is_secondary: boolean;
    is_post16: boolean;
    gender: string;
    year_range: string;
    ofsted_ranking: number;
    latitude: number;
    longitude: number;
};

export type SchoolCounts = {
    area: string;
    ofsted_rankings: [{
        ranking: string;
        count: number;
    }]
}

export type Crime = {
    lsoa_id: string;
    date: Date; //may need changing
    latitude: number;
    longitude: number;
    crime_type: string;
};

export type CrimeTypes = {
    values: string[]
}

export type UniqueMonths = {
    values: Date[]
}

export type Property = {
    property_id: string;
    full_address: string;
    postcode: string;
    lsoa_id: string;
    property_type: "D" | "S" | "T" | "F";
    square_metres: number;
    latitude: number;
    longitude: number;
};

export type KentAverage = {
    property_type: "D" | "S" | "T" | "F";
    period: string;
    avg_price: number;
    avg_price_sqm: number;
    count: number;
};

export type PropertyTransaction = {
    property_id: string;
    transaction_id: string;
    is_new_build: "Y" | "N";
    sale_date: string;
    price: number;
    price_per_sqm: number;
};