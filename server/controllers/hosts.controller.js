// Controller for /api/hosts
//
// Step 4: getHostListings(req, res)
//   - hostId is not a number -> 400, no places found -> 404
//   - try/catch -> 500 { error }
const hostsDal = require("../dal/hosts.dal");

async function getHostListings(req, res) {
  try {
    const { hostId } = req.params;
    const hostIdNumber = Number(hostId);

    if (!Number.isSafeInteger(hostIdNumber) || hostIdNumber <= 0 || hostId.trim() === "") {
      return res.status(400).json({ error: "Invalid hostId" });
    }

    const listings = await hostsDal.getListingsByHost(hostIdNumber);

    if (listings.length === 0) {
      return res.status(404).json({ error: "Host not found" });
    }

    return res.json(listings);

  } catch (error) {
    return res.status(500).json({
      error: "Database query failed"
    });
  }
}

module.exports = { getHostListings };