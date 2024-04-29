import logging
import re
import azure.functions as func
import openai

def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        req_body = req.get_json()

        if 'prompt' not in req_body or not req_body['prompt']:
            return func.HttpResponse('Invalid request. Missing or empty "prompt" parameter.', status_code=400)

        prompt = req_body['prompt']
        temperature = float(req_body.get('temperature', 1.0))  


        max_tokens = 3000  
        if len(prompt) > 100:
            max_tokens = 5000  

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": prompt}
            ],
            max_tokens=max_tokens,
            temperature=temperature
        )

        if 'choices' in response and response['choices']:
            completion_text = response['choices'][0]['message']['content']

            formatted_response = format_response(completion_text)

            return func.HttpResponse(formatted_response)
        else:
            return func.HttpResponse('Unexpected response from OpenAI API.', status_code=500)

    except ValueError as e:
        return func.HttpResponse(f'Invalid parameter value: {str(e)}', status_code=400)

    except openai.OpenAIError as e:
        return func.HttpResponse(f'OpenAI API error: {str(e)}', status_code=500)

    except Exception as e:
        logging.error(f"Error in main(): {str(e)}")
        return func.HttpResponse('Internal Server Error', status_code=500)

def format_response(completion_text):
    """Format the completion text into structured code snippets with language annotations."""
    formatted_response = []

    current_block = []
    current_language = None

    lines = completion_text.split('\n')
    for line in lines:
        if line.strip().startswith('```'):

            if current_block:
                formatted_response.append(f"```{current_language}\n" + '\n'.join(current_block) + "\n```")
                current_block = []

            match = re.match(r'^```(\w+)', line.strip())
            if match:
                current_language = match.group(1)
            else:
                current_language = ''  
        else:
            current_block.append(line)

    if current_block:
        formatted_response.append(f"```{current_language}\n" + '\n'.join(current_block) + "\n```")

    return '\n\n'.join(formatted_response)
