import axios from "axios";

import React, { useEffect, useRef, useState } from "react";
import { LinkPreview } from "../ui/link-preview";

interface PlaceReview {
    placeName: string;
    placeAddress: string;
    googleMapsUrl: string;
    authorName: string;
    rating: number;
    text: string;
    time: number;
}

interface ReviewMessagesProps {
    reviews: PlaceReview[];
}

const ReviewsList: React.FC<ReviewMessagesProps> = ({ reviews: reviews }) => {
    const [height, setHeight] = useState<number>(0);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current) {
            const newHeight = reviews.length > 0 ? ref.current.scrollHeight : 0;
            setHeight(newHeight);
        }
    }, [reviews]);

    return (
        <div className="min-h-[30vh] transition-all duration-300 ease-in-out" style={{ height: height }}>
            <div ref={ref} className="bg-zinc-50 dark:bg-zinc-900 rounded-lg p-4 my-4">
                {reviews.length > 0 ? (
                    reviews.map((review, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-black rounded-lg p-6 shadow-lg m-6 gap-6 shadow-zinc-300 dark:shadow-zinc-600"
                        >
                            <h3 className="font-bold text-xl text-zinc-900 dark:text-zinc-100 mb-6">
                                {review.placeName}
                            </h3>
                            <div className="border-2 mb-6 border-zinc-500 animate-shimmer bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-zinc-300 transition-colors rounded-md p-3 mb-4">
                                <p className="text-sm text-zinc-300">{review.placeAddress}</p>
                                <LinkPreview url={review.googleMapsUrl} className="text-white">
                                    View on Google Maps
                                </LinkPreview>
                            </div>
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
                                    {review.authorName}
                                </span>
                                <div className="flex items-center">
                                    <span className="font-bold text-yellow-500">{review.rating.toFixed(1)}</span>
                                </div>
                            </div>
                            <p className="text-zinc-600 dark:text-zinc-400 mb-6">{review.text}</p>
                            <span className="text-xs text-zinc-500 dark:text-zinc-500">
                                {new Date(review.time * 1000).toLocaleDateString()}
                            </span>
                        </div>
                    ))
                ) : (
                    <div className="text-black dark:text-white mb-4 last:mb-0 flex flex-col">
                        <p className="font-medium">You have not yet made any reviews.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export function UserReviewsCard() {
    let [reviewsList, setReviewsList] = useState<PlaceReview[]>([]);

    useEffect(() => {
        const doStuff = async () => {
            reviewsList = [];

            let newReviewsList: PlaceReview[] = [];

            try {
                const response = await axios.get(
                    "http://127.0.0.1:8000/users/api/get_reviews" // TODO: Change this, don't hardcode the domain
                );

                console.log(response.data);

                for (const review of response.data.reviews) {
                    newReviewsList.push({
                        placeName: review.place_name,
                        placeAddress: `${review.place_address.street_address}, ${review.place_address.locality}, ${review.place_address.region}, ${review.place_address.postal_code}, ${review.place_address.country_name}`,
                        googleMapsUrl: review.google_maps_page,
                        authorName: response.data.username,
                        rating: review.rating,
                        text: review.text,
                        time: review.timestamp,
                    });
                }
            } catch (error: any) {
                console.log(error);
            } finally {
                setReviewsList(newReviewsList);
            }
        };

        doStuff();
    }, []);

    return (
        <div className="max-w-md w-full rounded-none md:rounded-2xl p-4 md:p-8 shadow-input bg-white dark:bg-black overflow-auto max-h-[75vh] z-10 relative">
            <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">Your Reviews</h2>
            <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-300">
                Here, you can see a list of all the places you have left a review at.
            </p>
            <ReviewsList reviews={reviewsList} />
        </div>
    );
}
