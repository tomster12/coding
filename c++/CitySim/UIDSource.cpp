#include "stdafx.h"
#include "UIDSource.h"

int UIDSource::get()
{
	if (releasedUids.size() > 0)
	{
		auto uidItr = releasedUids.begin();
		int uid = *uidItr;
		releasedUids.erase(uidItr);
		return uid;
	}

	return nextUid++;
}

void UIDSource::release(int uid)
{
	releasedUids.insert(uid);
}

bool UIDSource::exists(int uid)
{
	return uid < nextUid && releasedUids.find(uid) == releasedUids.end();
}

void UIDSource::reset()
{
	releasedUids.clear();
	nextUid = 0;
}
