document.addEventListener('DOMContentLoaded', () => {
    const submitButton = document.getElementById('submitButton');
    const responseDiv = document.getElementById('response');
    const promptTextarea = document.getElementById('prompt');

submitButton.addEventListener('click', async () => {
    const prompt = promptTextarea.value.trim();
    if (prompt === '') {
        alert ('Please enter a prompt.');
        return;
    }

    try {
        const response = await fetch ('https://mybot810.azurewebsites.net', {
            method: 'POST', 
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: prompt,
                temperature: 1.0
            })
        });

        const data = await response.json();
        responseDiv.innerText = data.body;
    } catch (error) {
        console.error('Error:', error);
        responseDiv.innerText = 'An error occured. Please try again later.';
    }
    });
});