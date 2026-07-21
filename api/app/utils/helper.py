import string, secrets

def newApiKey():

    chars = string.ascii_letters + string.digits

    return ''.join(
        secrets.choice(chars)
        for _ in range(16)
    )

