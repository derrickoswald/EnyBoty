
const { OpenAI } = require("langchain/llms/openai");
const { APIChain } = require("langchain/chains");

// from https://github.com/makezurich/makezurich-badge-2023-circuitpython/tree/main/22-uplink-messages
const TTN_SAMPLE_ACCESS = `
# Python code to retrieve Make Zurich badge uplink events from The Things Network (TTN) 

from urllib.error import HTTPError, URLError
from urllib.request import urlopen, Request
import base64
import datetime
import json

# A valid API key is required.
API_KEY="NNSXS.OAUNIHLYA3LDYG6KRAAZABOX7UG7UGFCWYWNPQY.C3F3YIPY4LJAIWT36TGKQDYEJB2VWBHEN3TT77QYMSWQY3AY5TLQ"
APP_ID="mz-enyboty"
# Use device ID in case you want to retrieve messages for a specific device
DEVICE_ID="eui-2cf7f1205020ce0d-badgemichel"
N_MESSAGES=1
# Usually no need to change the message type
MSG_TYPE="uplink_message"

def make_request(url, headers=None):
    request = Request(url, headers=headers or {})
    try:
        with urlopen(request, timeout=10) as response:
            return response.read(), response
    except HTTPError as error:
        print(error.status, error.reason)
    except URLError as error:
        print(error.reason)
    except TimeoutError:
        print("Request timed out")

def get_payload(msg_json):
    payload = msg_json["result"]["uplink_message"]["frm_payload"]
    # Decode the payload from base64
    payload = base64.b64decode(payload).decode('utf-8')
    return payload


if __name__ == '__main__':
    # Receive uplink messages from the last hour
    # Mind that UTC is used for the timestamps
    now = datetime.datetime.now(datetime.timezone.utc)
    delta_time = datetime.timedelta(days = 60)
    after_time = now - delta_time
    headers={
        "Accept": "text/event-stream",
        "Authorization": f"Bearer {API_KEY}", }
    app_url = f'https://eu1.cloud.thethings.network/api/v3/as/applications/{APP_ID}/packages/storage/{MSG_TYPE}?limit={N_MESSAGES}&after={after_time.strftime("%Y-%m-%dT%H:%M:%SZ")}'
    body, response = make_request(app_url, headers)
    if body:
        print("\nResponse body for entire app:\n")
        myjson = json.loads(body.decode('utf-8'))
        print(json.dumps(myjson, indent=4))
        print(f"\nMessage payload:\n")
        print(get_payload(myjson))
    else:
        print("No message found for entire app.")

    device_url = f'https://eu1.cloud.thethings.network/api/v3/as/applications/{APP_ID}/devices/{DEVICE_ID}/packages/storage/{MSG_TYPE}?limit={N_MESSAGES}&after={after_time.strftime("%Y-%m-%dT%H:%M:%SZ")}'
    body, response = make_request(device_url, headers)
    if body:
        print(f"\nResponse body for device ID {DEVICE_ID}:\n")
        myjson = json.loads(body.decode('utf-8'))
        print(json.dumps(myjson, indent=4))
        print(f"\nMessage payload:\n")
        print(get_payload(myjson))
    else:
        print(f"No message found for device ID {DEVICE_ID}.")`;


async function run() {
  const model = new OpenAI({ modelName: "gpt-3.5-turbo-0301" });
  const chain = APIChain.fromLLMAndAPIDocs(model, TTN_SAMPLE_ACCESS);

  const res = await chain.call({
    question:
      "My API_KEY is NNSXS.OAUNIHLYA3LDYG6KRAAZABOX7UG7UGFCWYWNPQY.C3F3YIPY4LJAIWT36TGKQDYEJB2VWBHEN3TT77QYMSWQY3AY5TLQ and my APP_ID is mz-enyboty. What are the measurements from device eui-2cf7f1205020ce0d-badgemichel since 2023-06-09T15:00:00Z and show me the steps/trace as you get them.",
  });
  console.log({ res });
}

run();
