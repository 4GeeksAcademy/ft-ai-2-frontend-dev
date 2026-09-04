import sys

from string import (
    ascii_lowercase,
    ascii_uppercase
)


def vigenere_encode(source_text: str, key: str) -> str:
    def shift_char(c, alphabet, shift):
        idx = alphabet.index(c)
        return alphabet[(idx + shift) % len(alphabet)]

    result = []
    key_index = 0

    for character in source_text:
        if character.islower():
            shift = ord(key[key_index % len(key)].lower()) - ord('a')
            result.append(shift_char(character, ascii_lowercase, shift))
            key_index += 1
        elif character.isupper():
            shift = ord(key[key_index % len(key)].upper()) - ord('A')
            result.append(shift_char(character, ascii_uppercase, shift))
            key_index += 1
        else:
            result.append(character)

    return ''.join(result)


def vigenere_decode(encoded_text: str, key: str) -> str:
    def shift_char(c, alphabet, shift):
        idx = alphabet.index(c)
        return alphabet[(idx - shift) % len(alphabet)]

    result = []
    key_index = 0

    for character in encoded_text:
        if character.islower():
            shift = ord(key[key_index % len(key)].lower()) - ord('a')
            result.append(shift_char(character, ascii_lowercase, shift))
            key_index += 1
        elif character.isupper():
            shift = ord(key[key_index % len(key)].upper()) - ord('A')
            result.append(shift_char(character, ascii_uppercase, shift))
            key_index += 1
        else:
            result.append(character)

    return ''.join(result)


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python vigenere.py <encode|decode> <text> <key>")
        sys.exit(1)

    mode = sys.argv[1].lower()
    text = sys.argv[2]
    key = sys.argv[3]

    if mode == "encode":
        print(vigenere_encode(text, key))
    elif mode == "decode":
        print(vigenere_decode(text, key))
    else:
        print("Mode must be 'encode' or 'decode'")
        sys.exit(1)