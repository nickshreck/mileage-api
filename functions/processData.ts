import moment from "moment";

export const getMonthlyReview = (data: any, userId: string) => {
    // loop through the data and get the total distance for each month

    let monthlyReview = {
        totalDistance: 0,
        totalTrips: 0,
        totalPersonalDistance: 0,
        totalBusinessDistance: 0,
        totalUnclassifiedDistance: 0,
        totalPersonalTrips: 0,
        totalBusinessTrips: 0,
        totalUnclassifiedTrips: 0,
    };

    data.forEach((trip: any) => {
        monthlyReview.totalDistance += trip.distance;
        monthlyReview.totalTrips += 1;

        if (trip.classification === "personal") {
            monthlyReview.totalPersonalDistance += trip.distance;
            monthlyReview.totalPersonalTrips += 1;
        } else if (trip.classification === "business") {
            monthlyReview.totalBusinessDistance += trip.distance;
            monthlyReview.totalBusinessTrips += 1;
        } else {
            monthlyReview.totalUnclassifiedDistance += trip.distance;
            monthlyReview.totalUnclassifiedTrips += 1;
        }
    });

    const review = { data: data, monthlyReview: monthlyReview };

    data.monthlyReview = monthlyReview;

    // console.log("getMonthlyReview x4", data);

    return review;
};
