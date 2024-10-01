import axios from "axios";

import React, { useEffect, useRef, useState } from "react";
import { LinkPreview } from "../ui/link-preview";

interface FavoritePlace {
    placeName: string;
    placeAddress: string;
    googleMapsUrl: string;
}

interface FavoritePlaceMessagesProps {
    favoritePlaces: FavoritePlace[];
}

const ReviewsList: React.FC<FavoritePlaceMessagesProps> = ({ favoritePlaces: favoritePlaces }) => {
    const [height, setHeight] = useState<number>(0);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            const newHeight = favoritePlaces.length > 0 ? ref.current.scrollHeight : 0;
            setHeight(newHeight);
        }
    }, [favoritePlaces]);

    return (
        <div className="min-h-[30vh] transition-all duration-300 ease-in-out" style={{ height: height }}>
            <div ref={ref} className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 my-4">
                {favoritePlaces.length > 0 ? (
                    favoritePlaces.map((review, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-black rounded-lg p-6 m-6 shadow-lg shadow-zinc-300 dark:shadow-zinc-600"
                        >
                            <h3 className="font-bold text-xl text-zinc-900 dark:text-zinc-100 mb-2">
                                {review.placeName}
                            </h3>
                            <div className="border-2 border-zinc-500 animate-shimmer bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors rounded-md p-3 mb-4">
                                <p className="text-sm ">{review.placeAddress}</p>
                                <LinkPreview url={review.googleMapsUrl} className="text-white">
                                    View on Google Maps
                                </LinkPreview>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-black dark:text-white mb-4 last:mb-0 flex flex-col">
                        <p className="font-medium">You have not yet saved any places.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export function UserFavoritePlacesCard() {
    let [favoritePlaceList, setFavoritePlaceList] = useState<FavoritePlace[]>([]);

    useEffect(() => {
        const doStuff = async () => {
            favoritePlaceList = [];

            let newFavoritePlaces: FavoritePlace[] = [];

            try {
                const response = await axios.get(
                    "http://127.0.0.1:8000/users/api/get_favorite_places" // TODO: Change this, don't hardcode the domain
                );

                console.log(response.data);

                for (const favoritePlace of response.data.favorite_places) {
                    newFavoritePlaces.push({
                        placeName: favoritePlace.place_name,
                        placeAddress: `${favoritePlace.place_address.street_address}, ${favoritePlace.place_address.locality}, ${favoritePlace.place_address.region}, ${favoritePlace.place_address.postal_code}, ${favoritePlace.place_address.country_name}`,
                        googleMapsUrl: favoritePlace.google_maps_page,
                    });
                }
            } catch (error: any) {
                console.log(error);
            } finally {
                setFavoritePlaceList(newFavoritePlaces);
            }
        };

        doStuff();
    }, []);

    return (
        <div className="max-w-md w-full rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black overflow-auto h-fit max-h-[75vh] z-10 relative">
            <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">Your Favorite Places</h2>
            <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
                Here, you can see a list of all the places you have favorited.
            </p>
            <ReviewsList favoritePlaces={favoritePlaceList} />
        </div>
    );
}
