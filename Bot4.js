const openai = require('openai');

module.exports = async function (context, req) {
    try {
        const prompt = req.body.prompt;
        const temperature = parseFloat(req.body.temperature) || 1.0;

        let maxTokens = 3000;
        if (prompt.length > 100) {
            maxTokens = 5000;
        }

        const response = await openai.ChatCompletion.create({
            model: "text-davinci-003",
            messages: [
                { role: "user", content: prompt }
            ],
            maxTokens: maxTokens,
            temperature: temperature
        });

        if (response.choices && response.choices.length > 0) {
            const completionText = response.choices[0].message.content;
            const formattedResponse = formatResponse(completionText);
            context.res = {
                body: formattedResponse
            };
        } else {
            context.res = {
                status: 500,
                body: 'Unexpected response from OpenAI API.'
            };
        }
    } catch (error) {
        context.log.error(`Error: ${error}`);
        context.res = {
            status: 500,
            body: 'Internal Server Error'
        };
    }
};

function formatResponse(completionText) {
    const formattedResponse = [];
    let currentBlock = [];
    let currentLanguage = null;

    const lines = completionText.split('\n');
    for (const line of lines) {
        if (line.trim().startsWith('```')) {
            if (currentBlock.length > 0) {
                formattedResponse.push('```' + currentLanguage + '\n' + currentBlock.join('\n') + '\n```');
                currentBlock = [];
            }

            const match = line.trim().match(/^```(\w+)/);
            currentLanguage = match ? match[1] : '';
        } else {
            currentBlock.push(line);
        }
    }

    if (currentBlock.length > 0) {
        formattedResponse.push('```' + currentLanguage + '\n' + currentBlock.join('\n') + '\n```');
    }

    return formattedResponse.join('\n\n');
}
