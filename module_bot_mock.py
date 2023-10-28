import json

def robot_do_prepare_drinks (order_string):
    order = json.loads(order_string)
    #print ("Cocktail maker robot: I am preparing the drink:")
    print ("preparing " + str(order["number"]) + " " + order["size"] + " " + order["name"])
    #print ("It takes 5 minutes:")
    #print ("Ok, done!")

def interface_bot_mock(output_order):
    # todo get the order from response of openai
    #ai_reply = "{\"name\":\"Mojito\",\"size\":\"small\",\"number\":1}"
    robot_do_prepare_drinks (output_order)

if __name__ == "__main__":
    interface_bot_mock()