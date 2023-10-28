# input: customer order converted in text (modul_audio.py) 
# output: specifics of the oders (name of the order, size and the number of drinks)

# Hier we analyse the content of the order-text using openai API and the filter the order 
# specifications from the order-text.

import openai
import sys

def interface_AI(output_text_result):
    openai.api_key = "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"
    #todo define size "default"
    #todo define number"default"
    drink_size_list = "[small, medium, large, double shot]"
    drink_name_list = "[cola, gin, tonic, vodka, Mojito, Margarita, Cosmopolitan, Old Fashioned, Martini, Daiquiri, Piña Colada, Mai Tai, Moscow Mule, Long Island Iced Tea, Negroni, Bloody Mary, Manhattan, White Russian, Caipirinha, Whiskey Sour, Sex on the Beach, Tequila Sunrise, Espresso Martini, Tom Collins, Lager, IPA, Stout, Pilsner, Wheat Beer, Pale Ale, Saison, Porter, Belgian Tripel, Gose, Mojito, Margarita, Cosmopolitan, Old Fashioned, Martini, Daiquiri, Piña Colada, Mai Tai, Moscow Mule, Long Island Iced Tea]"

    # order_said = "Hi, bartender bot, how are you doing today? I am having a lot of fun today at the bar and I want to drink. I want to order a small mojito"

    prompt = "What drink's name do you see in this sentence and the size and the number of the drinks if mentioned? " + output_text_result + "print the output in this order and in json format with following keys: name, size, number. name key represents representing the name of the drink. size key represents the size of drink. number key represents number of ordered drinks. size value is one of the following:" + drink_size_list + ". name of the drink is one of the following: " + drink_name_list+". Only send back the json string, nothing else."

    # Make the API call
    completion = openai.Completion.create(
        engine="text-davinci-003",  # Choose an appropriate engine
        prompt=prompt,
        max_tokens=1024  # Adjust as needed
    )

    # Extract the AI's reply from the response
    output_order = completion.choices[0].text.strip()

    output = output_order
    print ("AI:", file=sys.stderr)
    print (output, file=sys.stderr)

    return output

if __name__ == "__main__":
    interface_AI()
