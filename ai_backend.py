import module_audio
import module_ai
import module_bot_mock
import os
import sys

import configparser



def trigger():

    config = configparser.ConfigParser()
    with open('.env', 'r') as f:
        config_string = '[dummy_section]\n' + f.read()

    config.read_string(config_string)

    root_path = config['dummy_section']['root_path']
    #print (root_path, file=sys.stderr)
           
    # Create the full path to the selected .wav file
    #wav_file_path = "/home/students/ga46pul/p-course/bar-bot/uploads/recordedAudio.wav"
    wav_file_path = os.path.join (root_path, "uploads/recordedAudio.wav")
    #print (wav_file_path, file=sys.stderr)

    sound = wav_file_path
    
    # instance of "interface_audio". Put sound as input to modul_audio.py and call the modul
    def provide_audio_input_and_get_output(sound):
        # Call the process_input function from my_module
        output_text = module_audio.interface_audio(sound)
        return output_text

    output_text_result = provide_audio_input_and_get_output(sound)
    
    #print(f"Input: {sound}, Output: {output_text_result}")

    # instance of "interface_AI". Put output_text_result as input to modul_ai.py and call the modul
    def provide_text_input_and_get_output(output_text_result):
        # Call the process_input function from my_module
        output_text = module_ai.interface_AI(output_text_result)
        return output_text

    output_order = provide_text_input_and_get_output(output_text_result)
    print("-----", file=sys.stderr)
    print(f"Input: {output_text_result}, Output: {output_order}", file=sys.stderr)
    print("-----", file=sys.stderr)
    # instance of "interface_bot_mock". Put output_order as input to modul_bot_mock.py and call the modul
    def provide_order_input_and_get_output(output_order):
        # Call the process_input function from my_module
        output_text = module_bot_mock.interface_bot_mock(output_order)
        return output_text

    output_order = provide_order_input_and_get_output(output_order)
    
    #print(f"Input: {output_order}, Output: {output_order}")

if __name__ == "__main__":
    trigger()