export type Vibe = "food" | "nature" | "culture" | "city";
export interface Location {
     id: string; 
     label: string; 
     lat: number; 
     lng: number; 
     country: string 
}
export interface Place { 
    id: string; 
    name: string; 
    vibe: Vibe; 
    rating: number; 
    reviews: number; 
    ratingSource: "stars" | "popularity"; 
    blurb: string; 
    lat: number; 
    lng: number; 
    priceLevel?: 0 | 1 | 2 | 3 | 4 
}
// recurring=true: from/to are "MM-DD" (every year). Otherwise they are full "YYYY-MM-DD" dates.
export interface Festival { 
    name: string; 
    venue: string; 
    from: string; 
    to: string; 
    blurb: string; 
    recurring: boolean; 
    url?: string 
}
export interface Day { 
    n: number; 
    date: string; 
    color: string; 
    region: string; 
    places: Place[]; 
    festivals: Festival[] 
}
