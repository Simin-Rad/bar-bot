# Bartender Robot


## Description











------------------------------------------
## Prerequisites
- Python

## Usage 
git link

### configure .env parameter including the following variables:

```bash
port=
redirection_path_ai=
redirection_path_put=
root_path=
api_key=
```

```bash
npm install
npx webpack --config webpack.config.js
```

### run server
```bash
npm run put-server
npm run ai-server
```
## Code documentation (Key Files)


## How to use bar-bot? (Setting Up a Discord Bot)
### Run server (Setting Up a Discord Bot)

### Set up Engine (Rule Engine)

## Engine model/Cpee model
### Endpoints:
- **POST /apply_rule**
  - **Parameters**:
    - `regex`: A regex pattern to be applied to the current orders.
    - `end`: End date for orders.
  - **Headers**:
    - `CPEE-CALLBACK`: The callback URL to which notifications should be sent. This header is set to false in case we have an orders/rule match and to false if we have an asynchronous call and the rule needs to be stored in the rules queue. The rule may be applied in the future and the corresponding waiting task is informed using the CPEE Callback URL that the task was executed.
  - **Responses**:
    - `200 OK`: Successfully processed the rule -> Regex syntax is correct.
    - `400 Bad Request`: Invalid regex provided.
    - `CPEE-CALLBACK`: A response header indicating if there is an asynchronous call or not (`true` or `false`). It is set to true in case there is the rule has no matching orders and the task may complete in the future. It is set to false in case there is no need for an asynchronous call and the rule has matching orders.


### data elements

#### parameters

### Graph workflow
## Example:
1. **Navigate to the following url**: https://cpee.org/flow/?monitor=https://cpee.org/flow/engine/22643/

![Alt text](./pictures/screen5.png?raw=true)

1. **Navigate to the Graph**:
    - Select the appropriate task.
    - Inside the `regex` argument field, input your desired rule. (example: "vodka")
    - Inside the `end` argument field, input your desired end date.
    > **Example**: If you're searching for orders with the keyword "vodka" that we made before that date: 2023-10-28T11:20, enter `vodka` and `2023-10-28T11:20` (SO 8601 format).

2. **Initiate the Task**:
    - Launch the task instance.
    - **Note**: Due to the absence of queued orders, the task indicator will appear in red. This signifies it's in standby mode, awaiting a response.

![Alt text](./pictures/screen4.png?raw=true)

4. **Access Discord**:
    - Open your Discord server.
    - Head over to the `#orders` channel.

5. **Test the Rule**:
    - To verify the rule, input an order, such as:
    ```
    Sex-on-the-beach small no orange slice
    ```
    Given that the task is on the lookout for the keyword "vodka", it will maintain its red status and will not process the order you've just provided.

6. **Send a Vodka Order**:
    - Now, place an order containing the word `vodka` in the `#orders` channel.
7. **Recognize & Complete**:
    - The system will recognize the "vodka" keyword in the order, completing the task instance and ceasing its function.
    - Subsequently, the rule targeting the keyword "vodka" gets removed from the rules queue for execution.

