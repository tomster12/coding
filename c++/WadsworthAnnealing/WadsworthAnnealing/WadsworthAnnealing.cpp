
#include <iostream>
#include <fstream> 
#include <string>
#include <deque>
#include <map>
#include <chrono>
#include <stdlib.h>
#include <math.h>
#include <time.h>


float getRandomFloat(float lo = 0.0f, float hi = 1.0f)
{
    return lo + static_cast <float> (rand()) / (static_cast <float> (RAND_MAX / (hi - lo)));
}

int getRandomInt(int lo=0, int hi=1)
{
    return lo + rand() % (hi - lo);
}


std::map<std::string, int> quadgramCount;
std::map<std::string, double> quadgramLog;
size_t quadgramTotal = 0;

void setupQuadgrams()
{
    std::string line;
    std::ifstream file("quadgrams.txt");
    if (file.is_open())
    {
        while (file)
        {
            std::getline(file, line);
            size_t spaceIndex = line.find(' ');
            std::string quadgram = line.substr(0, spaceIndex);
            int count = stoi(line.substr(spaceIndex + 1, line.size()));
            quadgramCount[quadgram] = count;
            quadgramTotal += count;
        }
    }
}

double getEnglishHeuristic(std::string word)
{
    double p = 0.0f;
    for (int i = 0; i < word.size() - 3; i++)
    {
        std::string quadgram = word.substr(i, 4);
        if (quadgramLog.count(quadgram))
        {
            p += quadgramLog[quadgram];
        }
        else
        {
            size_t gc = 1;
            if (quadgramCount.count(quadgram)) gc = quadgramCount[quadgram];
            double gp = log10((float)gc / quadgramTotal);
            quadgramLog[quadgram] = gp;
            p += gp;
        }
    }
    return p;
}


std::string encodeWadsworth(std::string ptAlphabet, std::string ctAlphabet, std::string plaintext)
{
    size_t ptAlphabet_size = ptAlphabet.size();
    size_t ctAlphabet_size = ctAlphabet.size();
    size_t pt_index = 0;
    size_t ct_index = 0;
    std::string ciphertext;
    for (char& c : plaintext)
    {
        size_t c_index = ptAlphabet.find(c);
        size_t pt_delta = c_index - pt_index;
        if (c_index <= pt_index) pt_delta += ptAlphabet_size;
        size_t ct_delta = pt_delta;
        pt_index = (pt_index + pt_delta) % ptAlphabet_size;
        ct_index = (ct_index + ct_delta) % ctAlphabet_size;
        ciphertext.push_back(ctAlphabet[ct_index]);
    }
    return ciphertext;
}

template<class T>
T runSimulatedAnnealing(
    float initialTemp, size_t tempSteps, size_t itrCount, size_t retainedCount,
    T(*funcInit)(), T(*funcNudge)(T), float(*funcFitness)(T)
) {
    struct TEval { T state; float fitness; };
    T initialState = funcInit();
    float initialFitness = funcFitness(initialState);
    TEval bestEval = { initialState, initialFitness };
    std::deque<TEval> bestStates = { bestEval };

    auto timeStart = std::chrono::high_resolution_clock::now();

    for (int k = 0; k < tempSteps; k++)
    {
        float temp = initialTemp * (1.0f - (float)k / tempSteps);
        for (int itr = 0; itr < itrCount; itr++)
        {
            T candidateState = funcNudge(bestEval.state);
            float candidateFitness = funcFitness(candidateState);
            float df = candidateFitness - bestEval.fitness;
            if ((df > 0.0f) || (df < 0.0f && getRandomFloat() < exp(df / temp)))
            {
                bestEval = { candidateState, candidateFitness };
                bestStates.push_back(bestEval);
                if (bestStates.size() > retainedCount) bestStates.pop_front();
            }
        }
    }

    auto timeStop = std::chrono::high_resolution_clock::now();
    auto timeDuration = std::chrono::duration_cast<std::chrono::microseconds>(timeStop - timeStart) / 1000.0f;

    std::cout << std::endl;
    std::cout << "Simulated Annealing Finished!" << std::endl;
    std::cout << "- initialTemp=" << initialTemp << ", tempSteps=" << tempSteps << ", itrCount=" << itrCount << std::endl;
    std::cout << "- Time Taken: " << timeDuration.count() << "ms" << std::endl;
    std::cout << "- Candidates Tested: " << (tempSteps * itrCount) << std::endl;
    std::cout << "- Best Overall: " << bestEval.fitness << std::endl;
    std::cout << std::endl;
    return bestEval.state;
}


float numInit() { return getRandomFloat(-200.0f, 200.0f); }

float numNudge(float x) { return x + getRandomFloat(-10.0f, 10.0f); }

float numFitness(float x) { return 1.0f / abs(10.0f - x); }


struct AlphabetPair { std::string ptAlphabet; std::string ctAlphabet; };

AlphabetPair wadsworthInit()
{
    return { "ABCDEFGHIJKLMNOPQRSTUVWXYZ", "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" };
}

AlphabetPair wadsworthNudge(AlphabetPair pair)
{
    std::string ptAlphabet = pair.ptAlphabet;
    std::string ctAlphabet = pair.ctAlphabet;

    if (getRandomFloat() < 0.5f)
    {
        int i1 = getRandomInt(0, static_cast<int>(ptAlphabet.size()));
        int i2 = getRandomInt(0, static_cast<int>(ptAlphabet.size()));
        while (i1 == i2) i2 = getRandomInt(0, static_cast<int>(ptAlphabet.size()));
        char tmp = ptAlphabet[i1];
        ptAlphabet[i1] = ptAlphabet[i2];
        ptAlphabet[i2] = tmp;
    }
    else
    {
        int i1 = getRandomInt(0, static_cast<int>(ctAlphabet.size()));
        int i2 = getRandomInt(0, static_cast<int>(ctAlphabet.size()));
        while (i1 == i2) i2 = getRandomInt(0, static_cast<int>(ctAlphabet.size()));
        char tmp = ctAlphabet[i1];
        ctAlphabet[i1] = ctAlphabet[i2];
        ctAlphabet[i2] = tmp;
    }

    return { ptAlphabet, ctAlphabet };
}

float wadsworthFitness(AlphabetPair pair)
{
    std::string ciphertext = "NJWKQMCP1ICMEAY3KMUJO";
    std::string plaintext_decoded = encodeWadsworth(pair.ctAlphabet, pair.ptAlphabet, ciphertext);
    float fitness = static_cast<float>(getEnglishHeuristic(plaintext_decoded));
    return fitness;
}


int main()
{
    srand(static_cast<unsigned int>(time(NULL)));
    setupQuadgrams();

    //float best = runSimulatedAnnealing<float>(10, 200, 2000, 10, numInit, numNudge, numFitness);

    std::string ptAlphabet = "THCOQUYBAIVJEGWNKXMLPRSDFZ";
    std::string ctAlphabet = "3FRBEOG0NS7A4K1HXQL2VMZUYP69TDI85JWC";
    std::string plaintext = "ABADHULLMAGICISAROUND";
    std::string ciphertext = encodeWadsworth(ptAlphabet, ctAlphabet, plaintext);
    
    //std::string plaintextDecoded = encodeWadsworth(ctAlphabet, ptAlphabet, ciphertext);
    //std::cout << "Plaintext Alphabet: " << ptAlphabet << std::endl;
    //std::cout << "Ciphertext Alphabet: " << ctAlphabet << std::endl;
    //std::cout << "Plaintext: " << plaintext << std::endl;
    
    AlphabetPair bestPair = runSimulatedAnnealing<AlphabetPair>(10, 400, 5000, 10, wadsworthInit, wadsworthNudge, wadsworthFitness);
    std::string plaintextDecoded = encodeWadsworth(bestPair.ctAlphabet, bestPair.ptAlphabet, ciphertext);
    std::cout << "Plaintext Alphabet: " << bestPair.ptAlphabet << std::endl;
    std::cout << "Ciphertext Alphabet: " << bestPair.ctAlphabet << std::endl;

    std::cout << "Ciphertext: " << ciphertext << std::endl;
    std::cout << "Plaintext Decoded: " << plaintextDecoded << std::endl;
}
