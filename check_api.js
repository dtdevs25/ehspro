
async function check() {
    try {
        const res = await fetch('http://localhost:3000/api/collaborators');
        if (!res.ok) {
            console.log('API Error:', res.statusText);
            return;
        }
        const data = await res.json();
        console.log(`API returned ${data.length} collaborators.`);
        if (data.length > 0) {
            console.log('Sample:', data[0].name, 'BranchID:', data[0].branchId);
        }
    } catch (e) {
        console.log('Connection Failed:', e.message);
    }
}
check();
