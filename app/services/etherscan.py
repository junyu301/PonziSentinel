import time
import requests
from flask import current_app


def _get_api_key():
    return current_app.config["ETHERSCAN_API_KEY"]


def get_source_code(contract_address):
    api_key = _get_api_key()
    url = "https://api.etherscan.io/v2/api"
    params = {
        "chainid": 1,
        "module": "contract",
        "action": "getsourcecode",
        "address": contract_address,
        "apikey": api_key,
    }

    while True:
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            break
        except Exception as e:
            current_app.logger.warning(f"获取合约源码失败，重试中... {e}")
            time.sleep(3)

    status = response.json()["status"]
    if status == "0":
        result = response.json()["result"]
    else:
        result = response.json()["result"][0]["SourceCode"]
        if result == "":
            status = "0"
            result = "Invalid Address"
    return status, result


def get_creation_opcode_without_operand(contract_address):
    from pyevmasm import disassemble_all

    api_key = _get_api_key()
    url = "https://api.etherscan.io/v2/api"
    params = {
        "chainid": 1,
        "module": "contract",
        "action": "getcontractcreation",
        "contractaddresses": contract_address,
        "apikey": api_key,
    }

    while True:
        try:
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            break
        except Exception as e:
            current_app.logger.warning(f"获取合约创建信息失败，重试中... {e}")
            time.sleep(3)

    creation_bytecode = response.json()["result"][0]["creationBytecode"]
    instructions = list(disassemble_all(bytes.fromhex(creation_bytecode[2:])))
    readable_opcode = " ".join(instr.name for instr in instructions)
    return readable_opcode
