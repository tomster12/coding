
#pragma once

#include <cstdlib>



namespace Utility
{
	static constexpr double PI = 3.141592653589793238462643383279502884L;

	static float random(const float& lo, const float& hi)
	{
		return lo + static_cast <float> (rand()) / (static_cast <float> (RAND_MAX / (hi - lo)));
	}
};
