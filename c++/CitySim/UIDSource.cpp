#include "stdafx.h"
#include "UIDSource.h"

int UIDSource::get()
{
	if (releasedUIDs.size() > 0)
	{
		auto itr = releasedUIDs.begin();
		int uid = *itr;
		releasedUIDs.erase(itr);
		return uid;
	}

	return nextUID++;
}

void UIDSource::release(int uid)
{
	releasedUIDs.insert(uid);
}

bool UIDSource::exists(int uid)
{
	return uid < nextUID && releasedUIDs.find(uid) == releasedUIDs.end();
}

void UIDSource::reset()
{
	releasedUIDs.clear();
	nextUID = 0;
}
