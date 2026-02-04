
async function checkBranches() {
    const url = 'http://localhost:3000/api/branches';
    console.log(`Fetching: ${url}`);
    try {
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            console.log(`✅ Success! Found ${data.length} branches.`);
            console.log(JSON.stringify(data[0], null, 2));
        } else {
            console.log(`❌ Failed: ${res.status} ${res.statusText}`);
            const text = await res.text();
            console.log('Error Body:', text);
        }
    } catch (e) {
        console.log('❌ Connection Error:', e.message);
    }
}
checkBranches();
