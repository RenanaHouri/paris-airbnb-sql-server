// Controller for /api/listings - reads req.query / req.params, validates, calls the DAL,
// sets the status code and sends JSON. No SQL here.
//
// Step 2: getListings(req, res)
//   - read neighbourhood, roomType, minPrice, maxPrice, sort, limit from req.query
//   - validate: limit (default 20, max 50), minPrice/maxPrice are numbers, sort is "price" or "rating"
//     (anything else -> 400 { error })
//   - map sort to a column name here: ORDER BY can't be a parameter
//
// Step 3: getListingById(req, res)
//   - id is not a number -> 400, no such id -> 404
//   - convert hostIsSuperhost 't' / 'f' to true / false
//
// Every controller: try/catch -> 500 { error } when the DAL throws.
const listingsDal = require("../dal/listings.dal");

async function getListings(req, res) {
  try {
    const {
      neighbourhood,
      roomType,
      minPrice,
      maxPrice,
      sort = "price",
      limit = "20"
    } = req.query;
  


  if (minPrice !== undefined) {
  const price = Number(minPrice);

  if (!Number.isFinite(price) || price < 0 || minPrice.trim() === "") {
    return res.status(400).json({
      error: "Invalid minPrice"
    });
  }
}
if (maxPrice !== undefined) {
  const price = Number(maxPrice);

  if (!Number.isFinite(price) || price < 0 || maxPrice.trim() === "") {
    return res.status(400).json({
      error: "Invalid maxPrice"
    });
  }
}
if (sort !== "price" && sort !== "rating") {
  return res.status(400).json({
    error: "Invalid sort"
  });
}

let orderBy;
if (sort === "price") {
  orderBy = "price ASC";
} else {
  orderBy = "review_scores_rating DESC";
}
const limitNumber = Number(limit);

if (
  !Number.isInteger(limitNumber) ||
  limitNumber < 1 ||
  limit.trim() === ""
) {
  return res.status(400).json({
    error: "limit must be a whole number from 1 to 50"
  });
}

const finalLimit = Math.min(limitNumber, 50);
const listings = await listingsDal.getListings({
  neighbourhood,
  roomType,
  minPrice,
  maxPrice,
  orderBy,
  limit: finalLimit
});

return res.json(listings);
}

 catch (error) {
    res.status(500).json({
      error: "Database query failed"
    });
  }
}


async function getListingById(req, res) {
  try {
    const { id } = req.params;
    const idNumber = Number(id);

    if (!Number.isSafeInteger(idNumber) || idNumber <= 0 || id.trim() === "") {
      return res.status(400).json({ error: "Invalid id" });
    }

    const listing = await listingsDal.getListingById(idNumber);

    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }
    if (listing.hostIsSuperhost === "t") 
    {
      listing.hostIsSuperhost = true;
    } 
    else {
    listing.hostIsSuperhost = false;
    }

    return res.json(listing);

  } catch (error) {
    return res.status(500).json({
      error: "Database query failed"
    });
  }
}

module.exports = { getListings,getListingById  };