// DAL for listings - runs the SQL through the pool and returns the rows. No req / res here.
// Always pass values with .input(...) and use @name in the query.
//
// Step 2: getListings({ neighbourhood, roomType, minPrice, maxPrice, orderBy, limit })
//   SELECT TOP (@limit) ... FROM dbo.Paris_Airbnb_listings WHERE price IS NOT NULL ... ORDER BY ...
//   Build the fields in SQL: CONCAT (title), UPPER (propertyType), CAST ... AS INT, ROUND (stars)
//
// Step 3: getListingById(id)
//   DATEADD (hostSince), YEAR (hostSinceYear), DATEDIFF + GETDATE (yearsHosting), LEN (aboutLength)

const { sql, poolPromise } = require("../config/db");

async function getListings({
  neighbourhood,
  roomType,
  minPrice,
  maxPrice,
  orderBy,
  limit
}) {
  const pool = await poolPromise;
  const request = pool.request();

  request.input("limit", sql.Int, limit);
 let where = "WHERE price IS NOT NULL";
 let order="ORDER BY price ASC"

if (minPrice !== undefined) {
  request.input("minPrice", sql.Float, Number(minPrice));
  where += " AND price >= @minPrice";
}

if (maxPrice !== undefined) {
  request.input("maxPrice", sql.Float, Number(maxPrice));
  where += " AND price <= @maxPrice";
}
if (neighbourhood !== undefined) {
  request.input("neighbourhood", sql.NVarChar, neighbourhood);
  where += " AND neighbourhood_cleansed = @neighbourhood";
}
if(roomType!==undefined)
{
    request.input("roomType",sql.NVarChar,roomType)
    where+=" AND room_type=@roomType"
}
 if(orderBy =="review_scores_rating DESC")
 {
    order="ORDER BY review_scores_rating DESC"
 }
  const result = await request.query(`
  SELECT TOP (@limit)
    CAST(id AS INT) AS id,
    CONCAT(room_type, ' in ', neighbourhood_cleansed) AS title,
    UPPER(property_type) AS propertyType,
    room_type AS roomType,
    neighbourhood_cleansed AS neighbourhood,
    CAST(price AS INT) AS pricePerNight,
    ROUND(review_scores_rating / 20.0, 1) AS stars,
    CAST(number_of_reviews AS INT) AS reviewsCount,
    CAST(bedrooms AS INT) AS bedrooms,
    CAST(beds AS INT) AS beds,
    CAST(accommodates AS INT) AS accommodates
    FROM dbo.Paris_Airbnb_listings
    ${where}
    ${order}
`);
return result.recordset;
}

async function getListingById(id) {
    const pool = await poolPromise;
    const request = pool.request();

    request.input("id", sql.Float, id);
    const result = await request.query(`
    SELECT
        CAST(id AS INT) AS id,
        CONCAT(room_type, ' in ', neighbourhood_cleansed) AS title,
        UPPER(property_type) AS propertyType,
        room_type AS roomType,
        neighbourhood_cleansed AS neighbourhood,
        CAST(price AS INT) AS pricePerNight,
        ROUND(review_scores_rating / 20.0, 1) AS stars,
        CAST(number_of_reviews AS INT) AS reviewsCount,
        CAST(bedrooms AS INT) AS bedrooms,
        CAST(beds AS INT) AS beds,
        CAST(accommodates AS INT) AS accommodates,
        CAST(bathrooms AS INT) AS bathrooms,
        latitude,
        longitude,
        CAST(host_id AS INT) AS hostId,
        host_name AS hostName,
        host_is_superhost AS hostIsSuperhost,
        DATEADD(day, host_since - 2, '1900-01-01') AS hostSince,
        YEAR(DATEADD(day, host_since - 2, '1900-01-01')) AS hostSinceYear,
        DATEDIFF(year, DATEADD(day, host_since - 2, '1900-01-01'), GETDATE()) AS yearsHosting,
        host_about AS hostAbout,
        CAST(LEN(host_about) AS INT) AS aboutLength
    FROM dbo.Paris_Airbnb_listings
    WHERE id = @id
`);
return result.recordset[0];
}


module.exports = { getListings ,getListingById };