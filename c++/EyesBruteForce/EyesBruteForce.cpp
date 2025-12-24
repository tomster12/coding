#include <iostream>
#include <vector>
#include <map>
#include <cstdint>

class Alphabet
{
public:
	static Alphabet English()
	{
		std::vector<char> letters;
		for (int i = 0; i < 26; ++i) letters.push_back('a' + i);
		return Alphabet(letters);
	}

	static Alphabet Ascii(int count)
	{
		std::vector<char> letters;
		for (int i = 0; i < count; ++i) letters.push_back(static_cast<char>(32 + i));
		return Alphabet(letters);
	}

	int fromIndex(int index)
	{
		return letters[index];
	}

	int toIndex(char letter)
	{
		for (int i = 0; i < letters.size(); ++i)
		{
			if (letters[i] == letter) return i;
		}
		return -1;
	}

	size_t size()
	{
		return letters.size();
	}

private:
	std::vector<char> letters;

	Alphabet(std::vector<char> letters) : letters(letters) {}
};

static std::vector<char> initialiseDeck(Alphabet* alphabet)
{
	std::vector<char> deck(alphabet->size());
	for (int i = 0; i < alphabet->size(); ++i)
	{
		deck[i] = alphabet->fromIndex(i);
	}
	return deck;
}

static void printText(std::vector<char>& text, bool wrapper = true)
{
	if (wrapper) printf("[");
	for (int i = 0; i < text.size(); ++i)
	{
		printf("%c", text[i]);
	}
	if (wrapper) printf("]");
	printf("\n");
}

static std::vector<char> stringToText(std::string textString)
{
	std::vector<char> text;
	for (int i = 0; i < textString.size(); ++i) text.push_back(textString.at(i));
	return text;
}

class Action
{
public:
	Action() : from(0), to(0), length(0)
	{}

	Action(int from, int to, int length) : from(from), to(to), length(length)
	{}

	void act(std::vector<char>& message)
	{
		if (length == 0) return;

		for (int i = 0; i < length; i++)
		{
			int fromIndex = (from + i) % message.size();
			int toIndex = (to + i) % message.size();
			uint8_t tmp = message[toIndex];
			message[toIndex] = message[fromIndex];
			message[fromIndex] = tmp;
		}
	}

	void print()
	{
		printf("(%d : %d -> %d)", this->length, this->from, this->to);
	}

private:
	int from, to, length;
};

class AlphabetActions
{
public:
	AlphabetActions(Alphabet* alphabet) : alphabet(alphabet) {}

	void setActions(char letter, std::vector<Action> letterActions)
	{
		actions[letter] = std::move(letterActions);
	}

	void act(std::vector<char>& deck, char letter)
	{
		for (int i = 0; i < actions[letter].size(); ++i)
		{
			actions[letter][i].act(deck);
		}
	}

	void print(bool newline = true)
	{
		for (int i = 0; i < alphabet->size(); ++i)
		{
			char letter = alphabet->fromIndex(i);
			printf("    [%c] = ", letter);

			for (size_t j = 0; j < actions[letter].size(); ++j)
			{
				actions[letter][j].print();
				printf(" ");
			}

			printf("\n");
		}
	}

	std::vector<Action>& getActions(char letter)
	{
		return actions[letter];
	}

private:
	Alphabet* alphabet;
	std::map<char, std::vector<Action>> actions;
};

int main()
{
	Alphabet plaintextAlphabet = Alphabet::English();
	Alphabet ciphertextAlphabet = Alphabet::Ascii(83);

	AlphabetActions actions = AlphabetActions(&plaintextAlphabet);
	std::vector<char> deck = initialiseDeck(&ciphertextAlphabet);

	for (int i = 0; i < plaintextAlphabet.size(); ++i)
	{
		char letter = plaintextAlphabet.fromIndex(i);
		actions.setActions(letter, { Action(0, i + 1, 1) });
	}
	actions.setActions('h', { Action(0, 42, 41) });

	printf("Actions:\n");
	actions.print();

	std::string plaintextString = "helloworld";
	std::vector<char> plaintext = stringToText(plaintextString);

	printf("\nPlaintext: ");
	printText(plaintext);

	printf("Initial Deck: ");
	printText(deck);

	std::vector<char> ciphertext = std::vector<char>();
	for (int i = 0; i < plaintext.size(); ++i)
	{
		char letter = plaintext[i];
		actions.act(deck, letter);
		ciphertext.push_back(deck[0]);

		printf("[%c] = ", letter);
		auto letterActions = actions.getActions(letter);
		for (size_t j = 0; j < letterActions.size(); ++j)
		{
			letterActions[j].print();
			printf(" ");
		}
		printf("-> ");
		printText(deck);
	}

	printf("Ciphertext: ");
	printText(ciphertext);
}
