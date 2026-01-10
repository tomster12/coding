#include <iostream>
#include <vector>
#include <cassert>
#include <random>
#include <unordered_map>
#include <chrono>

//#define LOG_DEBUG

// ------------------- Data Structures -------------------

struct Swap { size_t a, b; };

struct TripleSwap { Swap s1, s2, s3; };

static void PrintText(const std::vector<size_t>& text);

class Element
{
public:
	std::vector<size_t> letters;

	Element() {}
	Element(std::vector<size_t> l) : letters(std::move(l)) {}

	static Element Identity(size_t size)
	{
		std::vector<size_t> l(size);
		for (size_t i = 0; i < size; ++i) l[i] = i;
		return Element(l);
	}

	static Element Random(size_t size)
	{
		std::vector<size_t> l(size);
		for (size_t i = 0; i < size; ++i) l[i] = i;
		static thread_local std::mt19937 rng{ std::random_device{}() };
		std::shuffle(l.begin(), l.end(), rng);
		return Element(l);
	}

	Element ComposeLeft(const Element& lhs) const
	{
		assert(letters.size() == lhs.letters.size());
		std::vector<size_t> newLetters(letters.size());
		for (size_t i = 0; i < letters.size(); ++i) newLetters[i] = lhs.letters[letters[i]];
		return Element(newLetters);
	}

	void ApplySwap(size_t a, size_t b)
	{
		std::swap(letters[a], letters[b]);
	}

	void Print() const
	{
		PrintText(letters);
	}
};

class Isomorph
{
public:
	std::unordered_map<size_t, size_t> map;
	size_t nextId = 0;

	size_t GetId(size_t letter)
	{
		auto it = map.find(letter);
		if (it != map.end()) return it->second;
		size_t id = nextId++;
		map[letter] = id;
		return id;
	}

	size_t CheckId(size_t letter) const
	{
		auto it = map.find(letter);
		if (it != map.end()) return it->second;
		return nextId + 1;
	}
};

std::vector<Swap> AllSwaps(size_t size)
{
	std::vector<Swap> swaps;
	for (size_t a = 0; a < size; ++a)
	{
		for (size_t b = a + 1; b < size; ++b)
		{
			swaps.push_back({ a, b });
		}
	}
	return swaps;
}

// ------------------- Utility -------------------

size_t globalTripleCount = 0;

static void TallyCheck()
{
	globalTripleCount++;
	if (globalTripleCount % 500000 == 0) printf("[triple count marker: %zu]\n", globalTripleCount);
}

static std::vector<size_t> TextFromString(const std::string& textString)
{
	std::vector<size_t> text(textString.size());
	for (size_t i = 0; i < textString.size(); ++i)
	{
		char c = textString[i];
		text[i] = static_cast<size_t>(c - 'a');
	}
	return text;
}

static void PrintTripleSwap(const TripleSwap& t)
{
	printf("(%zu,%zu).(%zu,%zu).(%zu,%zu)",
		t.s1.a, t.s1.b,
		t.s2.a, t.s2.b,
		t.s3.a, t.s3.b);
}

static void PrintText(const std::vector<size_t>& text)
{
	printf("[");
	for (size_t i = 0; i < text.size(); ++i)
	{
		printf("%zu", text[i]);
		if (i + 1 < text.size()) printf(" ");
	}
	printf("]\n");
}

static void PrintTextAscii(const std::vector<size_t>& text, int offset)
{
	for (size_t i = 0; i < text.size(); ++i)
	{
		char c = static_cast<char>(offset + text[i]);
		printf("%c", c);
	}
	std::cout << "\n";
}

static void PrintSetup(
	const Element& ctBaseState,
	const Element& ptBasePermutation,
	const std::vector<size_t>& pt,
	const std::vector<size_t>& ct,
	size_t ptAlphabetSize, size_t ctAlphabetSize)
{
	printf("PT Alphabet size: %zu\n", ptAlphabetSize);
	printf("CT Alphabet size: %zu\n", ctAlphabetSize);

	printf("\nPT: ");
	PrintText(pt);

	printf("PT ASCII (+97): ");
	PrintTextAscii(pt, 97);

	printf("\nCT: ");
	PrintText(ct);

	printf("CT ASCII (+32): ");
	PrintTextAscii(ct, 32);

	printf("\nCT Base state: ");
	ctBaseState.Print();

	printf("PT Base permutation: ");
	ptBasePermutation.Print();

	printf("\n");
}

static void PrintRepeatedApplication(
	size_t index, size_t ptLetter, size_t ctLetter)
{
	#ifdef LOG_DEBUG
	printf("Index %zu: Using existing triple for PT %zu\n", index, ptLetter);
	#endif
}

static void PrintNewApplication(
	size_t index, size_t ptLetter, size_t ctLetter,
	TripleSwap& triple, const Element& prevState, const Element& nextState)
{
	#ifdef LOG_DEBUG
	printf("Index %zu: Found valid triple ", index);
	PrintTripleSwap(triple);
	printf(" for PT %zu to get CT %zu\n", ptLetter, ctLetter);
	#endif
}

// ------------------- Main Algorithm and Driver -------------------

static bool DFS(
	const std::vector<size_t>& pt,
	const std::vector<size_t>& ct,
	size_t index,
	const Element& ctPrevState,
	const Element& ptBasePermutation,
	std::unordered_map<size_t, TripleSwap>& ptPermutations,
	const std::vector<Swap>& allSwaps)
{
	if (index == pt.size()) return true;

	size_t ptLetter = pt[index];

	// Already assigned PT letter so reuse
	if (ptPermutations.count(ptLetter))
	{
		TripleSwap triple = ptPermutations[ptLetter];
		Element ctNextState = ctPrevState.ComposeLeft(ptBasePermutation);
		ctNextState.ApplySwap(triple.s1.a, triple.s1.b);
		ctNextState.ApplySwap(triple.s2.a, triple.s2.b);
		ctNextState.ApplySwap(triple.s3.a, triple.s3.b);

		if (ctNextState.letters[0] == ct[index])
		{
			PrintRepeatedApplication(index, ptLetter, ct[index]);
			return DFS(pt, ct, index + 1, ctNextState, ptBasePermutation, ptPermutations, allSwaps);
		}

		return false;
	}

	// Try all possible triple combinations for this PT
	bool found = false;
	for (const Swap& s1 : allSwaps)
	{
		for (const Swap& s2 : allSwaps)
		{
			for (const Swap& s3 : allSwaps)
			{
				TripleSwap triple = { s1, s2, s3 };
				Element ctNextState = ctPrevState.ComposeLeft(ptBasePermutation);
				ctNextState.ApplySwap(triple.s1.a, triple.s1.b);
				ctNextState.ApplySwap(triple.s2.a, triple.s2.b);
				ctNextState.ApplySwap(triple.s3.a, triple.s3.b);
				TallyCheck();

				if (ctNextState.letters[0] == ct[index])
				{
					PrintNewApplication(index, ptLetter, ct[index], triple, ctPrevState, ctNextState);
					ptPermutations[ptLetter] = triple;
					found = DFS(pt, ct, index + 1, ctNextState, ptBasePermutation, ptPermutations, allSwaps);
				}

				if (found) break;
			}
			if (found) break;
		}
		if (found) break;
	}
}

static void RunTesting(
	const std::vector<size_t>& pt,
	const std::vector<size_t>& ct,
	const Element& ctBaseState,
	const Element& ptBasePermutation,
	std::unordered_map<size_t, TripleSwap>& ptPermutations)
{
	printf("PT ASCII (+97): ");
	PrintTextAscii(pt, 97);

	printf("CT ASCII (+32): ");
	PrintTextAscii(ct, 32);

	Element state = ctBaseState;
	std::vector<size_t> outCt;
	for (int index = 0; index < ct.size(); ++index)
	{
		printf("\nIndex %d state ", index);
		state.Print();

		size_t ptLetter = pt[index];
		TripleSwap ptTriple = ptPermutations[ptLetter];
		Element ptPermutation = ptBasePermutation;
		state.ApplySwap(ptTriple.s1.a, ptTriple.s1.b);
		state.ApplySwap(ptTriple.s2.a, ptTriple.s2.b);
		state.ApplySwap(ptTriple.s3.a, ptTriple.s3.b);

		char ptChar = static_cast<char>(ptLetter + 97);
		printf("+ PT %zu (%c) = ", ptLetter, ptChar);
		ptPermutation.Print();

		state = state.ComposeLeft(ptPermutation);
		size_t ctLetter = state.letters[0];

		char ctChar = static_cast<char>(ctLetter + 32);
		printf("= CT %zu (%c) = ", ctLetter, ctChar);
		state.Print();
	}
}

int main()
{
	// Setup PT and CT for the DFS
	const size_t PTA_SIZE = 26;
	const size_t CTA_SIZE = 83;

	std::vector<size_t> ptAlphabet(PTA_SIZE);
	for (size_t i = 0; i < PTA_SIZE; ++i) ptAlphabet[i] = i;

	std::string ptEnglish = "helloworld";
	std::vector<size_t> pt = TextFromString(ptEnglish);
	std::vector<size_t> ct = { 50, 66, 5, 48, 62, 13, 75, 29, 24, 61 };

	// We will need isomorph
	// std::string ptEnglish = "seekingtruththewisefindinsteaditsprofoundabsence";
	// std::vector<size_t> pt = TextFromString(ptEnglish);
	// std::vector<size_t> ct = { 50, 66, 5, 48, 62, 13, 75, 29, 24, 61, 42, 70, 66, 62, 32, 14, 81, 8, 15, 78, 2, 29, 13, 49, 1, 80, 82, 40, 63, 81, 21, 19, 0, 40, 51, 65, 26, 14, 21, 70, 47, 44, 48, 42, 19, 48, 13, 47 };

	Element ptBasePermutation = Element::Random(CTA_SIZE);
	Element ctBaseState = Element::Identity(CTA_SIZE);

	PrintSetup(ctBaseState, ptBasePermutation, pt, ct, PTA_SIZE, CTA_SIZE);

	// Variables required for running DFS
	std::vector<Swap> allSwaps = AllSwaps(CTA_SIZE);
	std::unordered_map<size_t, TripleSwap> ptPermutations;

	// Run, time, and print the DFS
	printf("Starting DFS...\n");

	#ifdef LOG_DEBUG
	printf("-----------------\n");
	#endif

	auto start = std::chrono::high_resolution_clock::now();
	DFS(pt, ct, 0, ctBaseState, ptBasePermutation, ptPermutations, allSwaps);
	auto end = std::chrono::high_resolution_clock::now();
	std::chrono::duration<double> elapsed = end - start;

	#ifdef LOG_DEBUG
	printf("-----------------\n");
	#endif

	printf("DFS finished in% f seconds after viewing %zu triples.\n", elapsed.count(), globalTripleCount);

	// Run testing afterwards
	printf("\nTesting final plaintext permutations...\n\n");
	RunTesting(pt, ct, ctBaseState, ptBasePermutation, ptPermutations);

	return 0;
}
