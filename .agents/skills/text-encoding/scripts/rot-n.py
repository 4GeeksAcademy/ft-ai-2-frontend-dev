import sys

from string import (
    ascii_lowercase,
    ascii_uppercase
)

def rot_encode(source_text: str, n: int = 13) -> str:
    def shift_char(c, alphabet):
        idx = alphabet.index(c)
        return alphabet[(idx + n) % len(alphabet)]

    result = []
    for character in source_text:
        if character.islower():
            result.append(shift_char(character, ascii_lowercase))
        elif character.isupper():
            result.append(shift_char(character, ascii_uppercase))
        else:
            result.append(character)
    return ''.join(result)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python rot-n.py <text> [shift]")
        sys.exit(1)

    text = sys.argv[1]
    shift = int(sys.argv[2]) if len(sys.argv) > 2 else 13
    print(rot_encode(text, shift))
