
import threading
import nest_asyncio
from requests_html import HTMLSession
nest_asyncio.apply()
session = HTMLSession()


def getAllUrls(min, max):
    allUrls = []
    r = session.get('https://api.warframe.market/v1/items')
    urlsRaw = r.json()["payload"]["items"]
    if max == -1:
        max = len(urlsRaw)
    for i in range(min, max):
        allUrls.append(urlsRaw[i]["url_name"])
    return allUrls


def threadGetItems(allUrls, amount):
    threads = []
    items = []
    amn = int(len(allUrls) / amount)
    for i in range(0, len(allUrls), amn):

        urls = allUrls[i:i+amn]
        t = threading.Thread(target=getItems, args=(urls, items, ))
        threads.append(t)
        t.start()
        print("Starting Thread")

    for t in threads:
        t.join()
    print("Finished Threads")
    return items


def getItems(urls, items):
    for i in range(len(urls)):
        # TODO: Fix error 503
        r = session.get("https://api.warframe.market/v1/items/" + urls[i] + "/orders")

        if (r.status_code != 200):
            print("Error: " + str(r.status_code))
            print(urls[i])
            continue

        orders = r.json()["payload"]["orders"]
        item = {"name": urls[i], "buy": [], "sell": []}

        for order in orders:
            if (order["platform"] == "pc" and order["user"]["status"] == "ingame"):
                if ("mod_rank" not in order or order["mod_rank"] == 0):
                    item[order["order_type"]].append([order["platinum"], order["user"]["ingame_name"]])
        items.append(item)
        print("There are currently " + str(len(items)) + " items")


def getProfits(items):
    profits = []
    for item in items:
        for orderBuy in item["buy"]:
            for orderSell in item["sell"]:
                if (orderBuy[0] > orderSell[0]):
                    if len(profits) == 0 or profits[len(profits)-1]["name"] != item["name"]:
                        profits.append({"name": item["name"], "orderBuy": orderBuy, "orderSells": []})
                    profits[len(profits)-1]["orderSells"].append(orderSell)
    return profits


def printProfits(profits):
    for p in profits:
        print("\n\nName: " + p["name"])
        print(" Buyer: ")
        print("  Order: " + str(p["orderBuy"][0]) + "p : " + p["orderBuy"][1])
        print(" Sellers: ")
        for s in p["orderSells"]:
            print("  Order: " + str(s[0]) + "p : " + s[1])


if __name__ == "__main__":
    u1 = int(input("Start item:"))
    u2 = int(input("End item:"))
    threadAmount = int(input("Amount of threads:"))

    allUrls = getAllUrls(u1, u2)
    items = threadGetItems(allUrls, threadAmount)
    profits = getProfits(items)
    printProfits(profits)
