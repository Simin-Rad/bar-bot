import json

def robot_do_prepare_drinks (ai_reply_order_json):
    try: 
        order_dictionary = json.loads(ai_reply_order_json)
        print ("preparing " + str(order_dictionary["number"]) + " " + order_dictionary["size"] + " " + order_dictionary["name"])
    except ValueError as e:
        print ("sorry, I did not catch your order, will you try again?")
        return

def interface_bot_mock(ai_reply_order_json):
    robot_do_prepare_drinks (ai_reply_order_json)

if __name__ == "__main__":
    ai_reply_order_json1 = "{\"name\":\"Mojito\",\"size\":\"small\",\"number\":1}"
    interface_bot_mock(ai_reply_order_json1)

    ai_reply_order_json2 = "{\"name\":\"Mojito\",\"size\":\"small\",\"number\":1}"
    interface_bot_mock(ai_reply_order_json2)