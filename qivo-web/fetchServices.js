const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const API_URL = "http://localhost:5000/api/v1/services";

async function testServices() {
  try {
    const res = await fetch(API_URL);
    console.log("Status:", res.status);

    const data = await res.json();
    console.log("Number of services:", data.data.services.length);
    console.log("First service:", data.data.services[0]);
  } catch (err) {
    console.error("Error fetching services:", err.message);
  }
}

testServices();