
#include <iostream>

enum Day { // Declare each variable, setting their values to integers counting from 0
	Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
};

class Log { // EXAMPLE CLASS - BAD CODE
public:
	enum Level : unsigned char {
		LevelError, LevelWarning, LevelInfo
	};
private:
	static Level logLevel;

public:
	static void setLevel(Level level) {
		logLevel = level;
	}
	static void error(const char* message) {
		if (logLevel >= LevelError)
			std::cout << "[ERROR]: " << message << std::endl;
	}
	static void warn(const char* message) {
		if (logLevel >= LevelWarning)
			std::cout << "[WARNING]: " << message << std::endl;
	}
	static void info(const char* message) {
		if (logLevel >= LevelInfo)
			std::cout << "[INFO]: " << message << std::endl;
	}
};
Log::Level Log::logLevel = Log::LevelWarning;

int main() {
	Log::setLevel(Log::LevelWarning);
	Log::error("Example error");
	Log::warn("Example warning");
	Log::info("Example info");

	Day day1 = Wednesday;
	if (day1 > Monday)
		std::cout << day1 << std::endl;
	std::cin.get();
}