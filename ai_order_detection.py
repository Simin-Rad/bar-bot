import module_speech_recognition
import module_openai
import module_bot_mock
import os
import sys
import configparser
import time
import json

# instance of "interface_audio". Put sound as input to modul_audio.py and call the modul
def provide_audio_input_and_get_output(sound):
    # Call the process_input function from my_module
    output_text = module_speech_recognition.interface_audio(sound)
    return output_text

# instance of "interface_openai". Put output_text_result as input to modul_ai.py and call the modul
def provide_text_input_and_get_output(output_text_result):
    # Call the process_input function from my_module
    output_text = module_openai.interface_openai(output_text_result)
    return output_text

# instance of "interface_bot_mock". Put output_order as input to modul_bot_mock.py and call the modul
def provide_order_input_and_get_output(output_order):
    # Call the process_input function from my_module
    output_text = module_bot_mock.interface_bot_mock(output_order)
    tmp_data = {'text': output_text}
    output_text = json.dumps(tmp_data)
    return output_text

# this is the public interface to the AI module
# the client js triggers the whole AI inference
# by calling this trigger. 
def trigger(ordertext):

    output_order = provide_text_input_and_get_output(ordertext)
    #print("-----", file=sys.stderr)
    #print(f"Input: {ordertext}", file=sys.stderr)
    #print(f"Output: {output_order}", file=sys.stderr)
    print(f"{output_order}", file=sys.stdout)
    #print("-----", file=sys.stderr)

    '''
    provide_order_input_and_get_output(output_order)
    print(f"Input: {output_order}, Output: {output_order}")
    '''

if __name__ == "__main__":
    args = sys.argv
    ordertext = args[1]
    print ("working on text: " + ordertext, file=sys.stderr)

    print ("start", file=sys.stderr)
    #time.sleep(3)
    
    trigger(ordertext)
    print ("done", file=sys.stderr)
    pass
