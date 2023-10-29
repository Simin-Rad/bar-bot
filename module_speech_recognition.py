# input: customer audio record (.wav file)
# output: customer audio record converted to text

# Hier we get the order from the customer as an audio file as input and convert it to text.
# The output of this python file (modul_audio.py) will be the input in modul_AI.py 
# file to analyse the the content of the text.

import speech_recognition as sr
import sys
import os
import configparser


def interface_audio(sound):

    r = sr.Recognizer()
    text = ""
    with sr.AudioFile (sound) as source:
        r.adjust_for_ambient_noise(source)
        print("Converting Audio_to_text", file=sys.stderr)
        audio = r.listen(source)

        try:
            text = r.recognize_google(audio)
            print(text, file=sys.stderr)
            
        except:
            print('Sorry, please try again!', file=sys.stderr)

    return text

if __name__ == "__main__":    
    config = configparser.ConfigParser()
    with open('.env', 'r') as f:
        config_string = '[dummy_section]\n' + f.read()
    config.read_string(config_string)
    root_path = config['dummy_section']['root_path']
    #print (root_path, file=sys.stderr)
           
    # Create the full path to the selected .wav file
    sound = os.path.join (root_path, "test_data/recordedAudio1.wav")
    interface_audio(sound)

    sound = os.path.join (root_path, "test_data/recordedAudio2.wav")
    interface_audio(sound)