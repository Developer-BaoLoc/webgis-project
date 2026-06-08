const API_URL =
    process.env.NEXT_PUBLIC_API_URL;

export const api = {
    wards: `${API_URL}/wards`,
    roads: `${API_URL}/roads`,
    rivers: `${API_URL}/rivers`,

    currentWard: (
        lat: number,
        lng: number
    ) =>
        `${API_URL}/wards/current?lat=${lat}&lng=${lng}`,
};