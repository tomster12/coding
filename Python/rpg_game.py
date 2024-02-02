from colorama import init
init(autoreset=True)
from colorama import Fore, Back, Style

#       TO DO


#   new weapons

#   new magic

#   new weapon affectors

#   quests

#   new Areas



#       --------------------------------
#       -          VARIABLES           -
#       --------------------------------




#   stating variables and importing modules



import random
import time

SwordDamage = 0
BroadswordDamage = 0
Difficulty = 0
Inventory = []
HP = 0
MHP = 0
MP = 0
MMP = 0
StP = 0
MStP = 0
AP = 0
HPPotion = 0
MPPotion = 0
WP = ''
LVL = 0
XP = 0
SP = 0
Area = 0
SwordProficency = []
BroadswordProficency = []
SpellProficency = []
ActiveEnemies = []
Money = 0
Delay = 0
FireState = [0,0,0]
Damage = [0,0]
Spells = []
ESp = ''




































































































#       -----------------------------
#       -           OTHER           -
#       -----------------------------




#   default variable state


def SetVar():
    global Difficulty
    global Inventory
    global HP
    global MHP
    global MP
    global MMP
    global StP
    global MStP
    global AP
    global HPPotion
    global MPpot
    global WP
    global LVL
    global XP
    global SP
    global Area
    global SwordProficency
    global BroadswordProficency
    global SpellProficency
    global ActiveEnemies
    global Money
    global Delay
    global FireState
    global Damage
    global Spells
    global ESp
    Difficulty = 0
    Inventory = ['wp sword']
    HP = 20
    MHP = 20
    MP = 20
    MMP = 20
    StP = 5
    MStP = 5
    AP = 0
    HPPotion = 1
    MPpot = 1
    WP = ''
    LVL = 0
    XP = 0
    SP = 0
    Area = 1
    SwordProficency = [0,5]
    BroadswordProficency = [0,8]
    SpellProficency = [0,6]
    ActiveEnemies = []
    Money = 0
    Delay = 1
    FireState = [0,0,0]
    Damage = [0,0]
    Spells = []
    ESp = ''


#                   Other misc commands


def Help():
    print('''-all commands-
-characteroverview
-invuse
-invunequip
-skillspend
-skillshow
-spelluse
-spellunequip
-explore
''')


def Space():
    for i in range(0,100):
        print('')


def Area():
    global Area
    while True:
        tmp2=input('Enter the number of the Area you would like to enter')
        tmp2 = int(tmp2)
        if tmp2 == 1 or tmp2 == 2 or tmp2 == 3:
            Area=tmp2
            print('entering Area',Area)
            break
        else:
            print('please enter a number from 1 to 3')




































































































#       --------------------------------
#       -       TOWN AND STORY         -
#       --------------------------------




#   Shops


def GeneralWares():
    global Money
    global HPPotion
    global MPpot
    global Inventory
    
    if Area == 1:
        i = random.randint(1,3)
        if i == 1:  
            print('Welcome to Bruce\'s shop, what can i get y\'?\n')
        elif i == 2:
            print('everything you see is for sale\n')
        else:
            print('welcome in!\n')
            
        Area1Shop=['Health Potion - 30ɮ', 'Mana Potion - 30ɮ', 'fatigue - spell - 125ɮ', 'lightning - spell - 80ɮ', 'lifesteal - spell - 150ɮ']
        for x in range(0,len(Area1Shop)):
            print('('+str(x+1)+')'+'-',Area1Shop[x])
        print('')
        Call=input(':>')
        Call=str(Call.lower())


        if Call == 'health potion' or Call == '1':
            if Money >= 30:
                print('that\'ll be 30ɮ')
                Money -= 30
                HPPotion += 1
            else:
                print('you have no money! go away!')


        if Call == 'mana potion' or Call == '2':
            if Money >= 30:
                print('that\'ll be 30ɮ')
                Money -= 30
                MPpot += 1
            else:
                print('you have no money! go away!')


        if Call == 'fatigue' or Call == '3':
            if Money >= 125:
                print('that\'ll be 125ɮ')
                Money -= 125
                Spells.append('fatigue')
            else:
                print('you have no money! go away!')


        if Call == 'lightning' or Call == '4':
            if Money >= 80:
                print('that\'ll be 80ɮ')
                Money -= 80
                Spells.append('lightning')
            else:
                print('you have no money! go away!')


        if Call == 'lifesteal' or Call == '5':
            if Money >= 150:
                print('that\'ll be 150ɮ')
                Money -= 150
                Spells.append('lifesteal')
            else:
                print('you have no money! go away!')


        print('')


def Blacksmith():
    global Money
    global Inventory
    
    if Area == 1:
        print('You new round \'ere? don\'t cause too much trouble.')
        Area1Shop=['wp sword of burning - 200ɮ', 'wp broadsword - 150ɮ']
        for x in range(0,len(Area1Shop)):
            if Area1Shop[x][0:2] == 'wp':
                print('('+str(x+1)+')'+'-'+Fore.MAGENTA+Area1Shop[x])
            else:
                print('('+str(x+1)+')'+'-',Area1Shop[x])
        print('')
        Call=input(':>')
        Call=str(Call.lower())


        if Call == 'wp sword of burning' or Call == '1':
            if Money >= 200:
                print('that\'ll be 200ɮ')
                Money -= 200
                Inventory.append('wp sword of burning')
            else:
                print('come back with money!')

                
        if Call == 'wp broadsword' or Call == '2':
            if Money >= 150:
                print('that\'ll be 150ɮ')
                Money -= 150
                Inventory.append('wp broadsword')
            else:
                print('come back with money!')
        print('')


#   text based outputs

                  
def Intro():
    while True:
        Call=input('Would you like to view the tutorial tips? y / n \n\n:>')
        Call=Call.lower()
        if Call == 'y':
            Tutorial()
            Story()
            break
        elif Call == 'n':
            Story()
            break
        else:
            print('invalid answer')


def Tutorial():
    print('you can type \'help\' at any point in the game to see all the current possible commands if they are not given\n')
    time.sleep(Delay*5)
    print('When using an item from your inventory make sure to type its name exactly the way its written\n')
    time.sleep(Delay*5)
    print('to use potions from your inventory simply type \'invuse \'health/mana\' potion\'\n\n')
    time.sleep(Delay*10)

    
def Story():
    print('Your head aches as you tread into the desert town, it\'s been a long journey but you have finally arrived.\n')
    time.sleep(Delay*5)
    print('As the distant sun sets, soft clinging of metal from a blacksmith can be heard and a light scent of beer can be smelt; this is a good place to rest.\n')
    time.sleep(Delay*5)
    print('You walk towards the middle of the town and decide what to do next.\n')
    time.sleep(Delay*5)
    print('type \'help\' for a list of commands\n')


#   Movement around an Area

                  
def Explore():
    print('where would you like to go?')
    if Area == 1:
        Call = input('''
-wilderness
-general wares
-blacksmith
-tavern

:>''')
        Call = Call.lower()
        time.sleep(Delay)
        if Call[0:10] == 'wilderness':
            Wilderness()
        elif Call[0:13] == 'general wares':
            GeneralWares()
        elif Call[0:10] == 'blacksmith':
            Blacksmith()
        else:
            print(Call,'isn\'t a valid choice')



































































































               
#       ---------------------------------
#       -INVENTORY/SKILLS/WEAPONS/SPELLS-
#       ---------------------------------




#   Skill based commands

                  
def SpendSkillPoints():
    global SP
    global MHP
    global MMP
    global MStP
    global SwordProficency
    global BroadswordProficency
    global SpellProficency
    if SP == 0:
        print('you have no skill points')
        print('')
        
    while SP > 0:
        print('Max Health : '+str(MHP))
        print('Max Mana   : '+str(MMP))
        print('Max Stamina: '+str(MStP),'\n')

        print('Sword Proficency:'+str(SwordProficency[0]))
        print('broadsword Proficency:'+str(BroadswordProficency[0]),'\n')

        print('Spell Proficency:'+str(SpellProficency[0]),'\n')

        print('Skill Points:'+str(SP),'\n')
        
        if SP == 0:
            print('you have no skill points')
            print('')
        else:
            Call=input('what would you like to upgrade? (type \'exit\' to leave)\n\n:>')
            Call=Call.lower()
            time.sleep(Delay)
            if Call == 'exit':
                break


            elif Call == 'max health':
                MHP += 1
                print('+1 Max Health')



            elif Call == 'max mana':
                MMP += 1
                print('+1 Max Mana')



            elif Call == 'max stamina':
                MStP += 1
                print('+1 Stamina')



            elif Call == 'sword proficency':
                SwordProficency[0] += 1
                print('+1 Sword Proficency')


                if SwordProficency[0] == 2:
                    print('Your sword attacks now cost 3 stamina!')
                    SwordProficency.append('Stamina Efficency')
                    SwordProficency[1] = 3


                if SwordProficency[0] == 4:
                    print('Your sword attacks now damage the enemies either side of your target!')
                    SwordProficency.append('Wide Swipe')



            elif Call == 'broadsword proficency':
                BroadswordProficency[0] += 1
                print('+1 Broadsword Proficency')



            elif Call == 'spell proficency':
                SpellProficency[0] += 1
                print('+1 Spell Proficency')


                
            else:
                print('no skill Called \''+Call+'\'')
                print('')
                break
            SP -= 1
            print('')


#   Character Overview


def CharacterOverview():
    print('-Inventory-\n')
    print('Health Potions: '+str(HPPotion))
    print('Mana Potions: '+str(MPpot))
    print('Money(ɮ): '+str(Money))
    print('Health  : '+str(HP))
    print('Mana    : '+str(MP))
    print('Stamina : '+str(StP))
    print('weapon  : '+Fore.MAGENTA+str(WP))
    for i in range(0, len(Inventory)):

        if Inventory[i][0:2] == 'wp':
            print('-'+Fore.MAGENTA+Inventory[i])
        else:
            print('-'+Fore.GREEN+Inventory[i])

    print('\n----------\n\n')



    print(Fore.MAGENTA+'Sword'+Fore.RESET+' Proficency:'+str(SwordProficency[0]))
    print('Stamina Cost:',SwordProficency[1])
    print('damage:'+str(SwordDamage))
    if len(SwordProficency) > 2:
        print(Fore.MAGENTA+'Sword'+Fore.RESET+' Skills:')
        for i in range(2,len(SwordProficency)):
            print('-'+str(SwordProficency[i]))
    print('')



    print(Fore.MAGENTA+'Broadsword'+Fore.RESET+' Proficency:'+str(BroadswordProficency[0]))
    print('Stamina Cost:',BroadswordProficency[1])
    print('damage:'+str(BroadswordDamage))
    if len(BroadswordProficency) > 2:
        print(Fore.MAGENTA+'Broadsword'+Fore.RESET+' Skills:')
        for i in range(2,len(BroadswordProficency)):
            print('-'+str(BroadswordProficency[i]))


    print('')


    print('-Spells-\n')
    print('equipped:'+Fore.CYAN+ESp)
    for i in range(0, len(Spells)):
        print('-'+Fore.CYAN+Spells[i])
    print('\n-------\n\n')



    print('Spell Proficency:'+str(SpellProficency[0]))
    print('Mana Cost:',SpellProficency[1])

    print('')

    if 'lightning' in Spells:
        print(Fore.CYAN+'Lightning'+Fore.RESET+' damage:'+str(LightningDamage)+'\n')

    if 'lifesteal' in Spells:
        print(Fore.CYAN+'Lifesteal'+Fore.RESET+' damage:'+str(LifestealDamage)+'\n')

    if 'fatigue' in Spells:
        print(Fore.CYAN+'Fatigue'+Fore.RESET+' damage:'+str(FatigueDamage))

    
    print('''\n
|LVL|%s|
|XP |%s|
|SP |%s|
    '''%(LVL,XP,SP))
    

#   Inventory Based Commands


def AddToInventory(Call):
    Inventory.append(str(Call[7:len(Call)]))
    print('added '+str(Call[7:len(Call)])+' to your inventory!')


def UseItemFromInventory(Call):
    global HP
    global MHP
    global MP
    global MMP
    global WP
    global HPPotion
    global MPpot

    if len(Call)>7:
        if str(Call[7:len(Call)]) in Inventory:

            if str(Call[7:9]) =='wp':
                if WP == '':
                    WP = str(Call[7:len(Call)])
                    print('you have equipped '+Fore.MAGENTA+WP)
                    Inventory.remove(str(Call[7:len(Call)]))
                else:
                    print('you have a weapon equiped, to unequip, type \'invunequip\'')

            else:
                print('item '+Fore.GREEN+str(Call[7:len(Call)])+Fore.RESET+' has been used!')
                Inventory.remove(str(Call[7:len(Call)]))

        elif str(Call[7:len(Call)]) == 'health potion':
            if HPPotion > 0:
                if HP<MHP:
                    print('health potion has been used!')
                    HP += 5
                    HPPotion -= 1
                else:
                    print('You have max health!')
            else:
                print('no health potions!')

        elif str(Call[7:len(Call)]) == 'mana potion':
            if MPpot > 0:
                if MP<MMP:
                    print('mana potion has been used!')
                    MP += 5
                    MPpot -= 1
                else:
                    print('You have max mana!')
            else:
                print('no mana potions!')
        else:
            print('no item with name '+str(Call[7:len(Call)])+'')
        print('')        


def InvUnequip():
    global WP
    if WP == '':
        print('no weapon equipped')
    else:
        print('unequiping '+Fore.MAGENTA+WP)
        Inventory.append(WP)
        WP=''
        
    print('')


#   Spell Based Commands


def UseSpell(Call):
    global Spells
    global ESp


    if len(Call)>9:
        if str(Call[9:len(Call)]) in Spells:

            if ESp== '':
                ESp = str(Call[9:len(Call)])
                print('you have equipped '+Fore.CYAN+ESp)
                Spells.remove(str(Call[9:len(Call)]))
            else:
                print('you have a spell equiped, to unequip, type \'spellunequip\'')

                
        else:
            print('no spell with name '+str(Call[9:len(Call)])+'')
        print('')


def UnequipSpell():
    global ESp
    if ESp == '':
        print('no spells equipped')
    else:
        print('unequiping '+Fore.CYAN+ESp)
        Spells.append(ESp)
        ESp=''
        
    print('')


#   Weapon Based Commands

                  
def WeaponCheck():
    global SwordDamage
    global BroadswordDamage

    SwordDamage = 5 + SwordProficency[0]
    if LVL % 2 == 0:
        SwordDamage+=LVL/2
    SwordDamage=int(SwordDamage)


    BroadswordDamage=13+int(BroadswordProficency[0])*2
    if LVL % 2 == 0:
        BroadswordDamage+=LVL/2
    BroadswordDamage=int(BroadswordDamage)


    if WP[3:8] == 'sword':

        Damage[0] = SwordDamage
        
        if WP[12:len(WP)]=='burning':
            Damage[1] = 1
        else:
            Damage[1] = 0


    if WP[3:13] == 'broadsword':

        Damage[0] = BroadswordDamage
        
        if WP[15:len(WP)]=='burning':
            Damage[1] = 1
        else:
            Damage[1] = 0



#   Spell Based Commands



def SpellCheck():
    global LightningDamage
    global LifestealDamage
    global FatigueDamage



    LightningDamage = 6 + SpellProficency[0]
    if LVL % 2 == 0:
        LightningDamage+=LVL/2


    LightningDamage=int(LightningDamage)





    LifestealDamage = 6 + SpellProficency[0]
    if LVL % 2 == 0:
        LifestealDamage+=LVL/2


    if LifestealDamage % 2 == 0:
        LifestealDamage = LifestealDamage/2
    else:
        LifestealDamage = (LifestealDamage+1)/2 

    
    LifestealDamage=int(LifestealDamage)





    FatigueDamage = 6 + SpellProficency[0]
    if LVL % 2 == 0:
        FatigueDamage+=LVL/2

    
    FatigueDamage=int(FatigueDamage)



    
    if ESp == 'lightning':
        
        Damage[0] = LightningDamage

    if ESp == 'lifesteal':
        
        Damage[0] = LifestealDamage

    if ESp == 'fatigue':
        
        Damage[0] = FatigueDamage
































































































#       -----------------------------
#       -   WILDERNESS AND BATTLE   -
#       -----------------------------


         
def Wilderness():
    global XP
    global Money
    time.sleep(Delay)
    i = random.randint(1,3)
    if i == 1:
        print('you walk confidently across the cracked desert, in search of wonder!')
    elif i == 2:
        print('you wander out into the vast landscape, looking for treasure.')
    else:
        print('as you exit the town, you ponder whether this is worth the risk...')

    time.sleep(Delay*5)
    i = random.randint(1,3)
    if i <= 3:
        Fight()


#           random adventures in wilderness


    else:
        if LVL<=4:
            tmp4=1
        elif LVL>=5 and LVL <=9:
            tmp4=2
        elif LVL>=10 and LVL <=14:
            tmp4=3
        elif LVL>=15 and LVL <=19:
            tmp4=4
        elif LVL >= 20:
            tmp4=5

        i = random.randint(1,3)
        
        if i == 1:
            print('you return to the village with pride and success')
            tmp7 = random.randint(tmp4*100,tmp4*200)
            print('+'+str(tmp7)+'XP')
            XP += tmp7
            
            tmp7 = random.randint(30,50)
            print('+'+str(tmp7)+'ɮ')
            Money += tmp7

        elif i == 2:
            print('you return after a prosperous adventure')
            tmp7 = random.randint(tmp4*50,tmp4*100)
            print('+'+str(tmp7)+'XP')
            XP += tmp7
            
            tmp7 = random.randint(20,30)
            print('+'+str(tmp7)+'ɮ')
            Money += tmp7
            
        else:
            print('you return slowly after a not so lucky trip')
            tmp7 = random.randint(tmp4*25,tmp4*50)
            print('+'+str(tmp7)+'XP')
            XP += tmp7
            
            tmp7 = random.randint(1,10)
            print('+'+str(tmp7)+'ɮ')
            Money += tmp7

        print('')


#           generating enemies based on level and Area

                  
#   Enemy [Name, Attack, Health, XP, Deals Fire?, On Fire?, Fire Damage To Take, can attack?]


def GenerateEnemies():
    global Area
    global LVL
    global ActiveEnemies
    if LVL<=4:
        tmp4=1
    elif LVL>=5 and LVL <=9:
        tmp4=2
    elif LVL>=10 and LVL <=14:
        tmp4=3
    elif LVL>=15 and LVL <=19:
        tmp4=4
    elif LVL >= 20:
        tmp4=5

    def StoneRoller():
        tmp5.append(random.randint(tmp4*5,tmp4*5+tmp4+1))
        tmp5.append(random.randint(tmp4*5,tmp4*5+tmp4+1))

    def MountainCrusher():
        tmp5.append(random.randint(tmp4*2,tmp4*2+tmp4+1))
        tmp5.append(random.randint(tmp4*10,tmp4*10+tmp4+1))

    def DesertSunfire():
        tmp5.append(random.randint(tmp4*4,tmp4*4+tmp4+1))
        tmp5.append(random.randint(tmp4*3,tmp4*3+tmp4+1))

    def ClifftopCrawler():
        tmp5.append(random.randint(tmp4*3,tmp4*15+tmp4+1))
        tmp5.append(random.randint(tmp4*4,tmp4*4+tmp4+1))

    def MarbleRockface():
        tmp5.append(random.randint(tmp4*8,tmp4*8+tmp4+1))
        tmp5.append(random.randint(tmp4*10,tmp4*10+tmp4+1))
        
    for i in range(0,tmp4):
        tmp5=[] 
        if Area == 1:
            if tmp4==1:
                tmp5.append('Stone Roller')
                StoneRoller()

            elif tmp4==2:
                tmp6=random.randint(1,10)
                if tmp6<9:
                    tmp5.append('Stone Roller')
                    StoneRoller()
                else:
                    tmp5.append('Mountain Crusher')
                    MountainCrusher()

            elif tmp4==3:
                tmp6=random.randint(1,10)
                if tmp6<3:
                    tmp5.append('Stone Roller')
                    StoneRoller()
                elif tmp6<9:
                    tmp5.append('Mountain Crusher')
                    MountainCrusher()
                else:
                    tmp5.ppend('Desert Sunfire')
                    DesertSunfire()

            elif tmp4==4:
                tmp6=random.randint(1,10)
                if tmp6<3:
                    tmp5.append('Mountain Crusher')
                    MountainCrusher()
                elif tmp6<9:
                    tmp5.append('Desert Sunfire')
                    DesertSunfire()
                else:
                    tmp5.append('Clifftop Crawler')
                    ClifftopCrawler()

            elif tmp4==5:
                tmp6=random.randint(1,10)
                if tmp6<7:
                    tmp5.append('Clifftop Crawler')
                    ClifftopCrawler()
                else:
                    tmp5.append('Marble Rockface')
                    MarbleRockface()
              

        tmp5.append((tmp5[1]+tmp5[2])*10+random.randint((tmp4*10)*2,((tmp4*10)+20)*2))

        if tmp5[0] == 'Desert Sunfire':
            tmp5.append(1)
        else:
            tmp5.append(0)

        for i in range(0,2):
            tmp5.append(0)
        tmp5.append(1)
        
        ActiveEnemies.append(tmp5)


#           main fight code

        
def Fight():
    global WP
    global SwordDamage
    global XP
    global HP
    global StP
    global MP
    global Inventory
    global Money
    global ActiveEnemies
    global FireState

    RunAttempt = 0

    def ShowActiveEnemies():
        for x in range(0,len(ActiveEnemies)):
            print('('+str(x+1)+')')
            print(ActiveEnemies[x][0])
            print('Damage:'+str(ActiveEnemies[x][1]))
            print('HP :'+str(ActiveEnemies[x][2]))
            if len(ActiveEnemies)-x>1:
                print('')

    def DealFire(x):
        global ActiveEnemies
        if Damage[1] == 1:
            i = random.randint(1,3)
            if i < 3:
                if ActiveEnemies[x][5] == 0:
                    print('you have set',ActiveEnemies[x][0],'('+str(x+1)+')','on '+Fore.RED+'fire!')
                    ActiveEnemies[x][5] = random.randint(2,3)
                    if Damage[0] % 2 == 0:
                        ActiveEnemies[x][6] = Damage[0]
                    else:
                        ActiveEnemies[x][6] = (Damage[0]+1)/2

                    ActiveEnemies[x][6] = int(ActiveEnemies[x][6])

    def TakeFireDamage():
        if FireState[0] >= 1:
            print('you have taken',str(FireState[1])+'Damage from '+Fore.RED+'fire!')
            HP -= FireState[1]
            FireState[0] -= 1
            if FireState[0] == 0:
                print('the '+Fore.RED+'fire'+Fore.RESET+' has gone out')
                print('')



    GenerateEnemies()

    if len(ActiveEnemies)==1:
        print('An enemy has appeared!\n')
    else:
        print('a group of enemies have appeared!\n')

    ShowActiveEnemies()

    StP= MStP

    while len(ActiveEnemies)>0:
        if HP<1:
            print('You have Died!')
            break
        
        print('')
        
        Call=input('''what would you like to do?
-showenemies
-characteroverview
-invuse
-invunequip
-spelluse
-spellunequip
-weaponattack
-spellattack
-turn
-run

:>''')
        
        time.sleep(Delay)

        if str.lower(Call[0:5]) == 'space':
            Space()
            
        elif str.lower(Call[0:3]) == 'run':
            if RunAttempt == 0:
                i = random.randint(1,3)
                if i == 1:
                    ActiveEnemies=[]
                    print('you run from the battle in fear\n')
                else:
                    RunAttempt = 1
                    print('you cannot run from this fight!')
            else:
                print('you cannot run from this fight!')
                
#           showenemies
        elif str.lower(Call[0:4]) == 'show':
            print('')
            ShowActiveEnemies()

#           invunequip
        elif str.lower(Call[0:5]) == 'invun':
            InvUnequip()

#           characteroverview
        elif str.lower(Call[0:4]) == 'char':
            CharacterOverview()
            
        elif str.lower(Call[0:6]) == 'invuse':
            if len(Call)>7:
                if Call[6] == ' ':
                    UseItemFromInventory(Call)
                else:
                    print('leave a space inbetween the command and the entered text.')

        elif str.lower(Call[0:8]) == 'spelluse':
            if len(Call)>9:
                if Call[8] == ' ':
                    UseSpell(Call)
                else:
                    print('leave a space inbetween the command and the entered text.')
            
#           spellunequip
        elif str.lower(Call[0:7]) == 'spellun':
            UnequipSpell()


































































































                
#       -----------------------------
#       -        Enemy Attack       -
#       -----------------------------
                  


        elif str.lower(Call[0:4]) == 'turn':
            StP=MStP
            for i in range(0,len(ActiveEnemies)):
                if ActiveEnemies[i][7] == 1:
                    print(ActiveEnemies[i][0],'has dealt',ActiveEnemies[i][1],'damage!')
                    HP -= ActiveEnemies[i][1]

                else:
                    print(ActiveEnemies[i][0],'did not attack you!')
                    


#                   enemy setting you on fire

                
                    if ActiveEnemies[i][4] == 1:
                        x = random.randint(1,3)
                        if x < 3:
                            if FireState[0] == 0:
                                print(ActiveEnemies[i][0],'has set you on '+Fore.RED+'fire!')
                  
                                if ActiveEnemies[i][1] % 2 == 0:
                                    tmp8 = ActiveEnemies[i][1]/2
                                else:
                                    tmp8 = (ActiveEnemies[i][1]+1)/2
                  
                                tmp8 = int(tmp8)
                                FireState = [random.randint(2,3),tmp8]


#                   enemy taking fire damage


                if ActiveEnemies[i][5] >= 1:
                    print(ActiveEnemies[i][0],'has taken',ActiveEnemies[i][6],'damage from '+Fore.RED+'fire!')
                    ActiveEnemies[i][2] -= ActiveEnemies[i][6]
                    ActiveEnemies[i][5] -= 1
                    if ActiveEnemies[i][5] == 0:
                        print(ActiveEnemies[i][0],'has put the '+Fore.RED+'fire'+Fore.RESET+' out')

                ActiveEnemies[i][7] = 1
                     
            print('')



































































































                  
#       -----------------------------
#       -     Attack - weapon       -
#       -----------------------------




#                   Choosing target

 
        elif str.lower(Call[0:12]) == 'weaponattack':

            WeaponCheck()
            
            if StP == 0:
                print('No stamina')
            else:
                if len(ActiveEnemies)>1:

                    
                    ShowActiveEnemies()
                    print('')
                    Target=input('who would you like to attack?')
                    Target=int(Target)
                    while Target<1 or Target>len(ActiveEnemies):  
                        print('please enter a value between 1 and',len(ActiveEnemies),'\n')
                        Target=input('who would you like to attack?')
                else:
                    Target=1




#               ---Dealing damage based on weapon---




#                   Sword


                if WP[3:8]=='sword':
                    if SwordProficency[1] <= StP:

                        
                        if 'Wide Swipe' in SwordProficency:
                            if Target > 1:  
                                x = Target-2
                                print('you have dealt',Damage[0],'damage to',ActiveEnemies[x][0],'with '+Fore.MAGENTA+WP)
                                ActiveEnemies[x][2] -= Damage[0]
                                DealFire(x)

                                
                        x = Target-1  
                        print('you have dealt',Damage[0],'damage to',ActiveEnemies[x][0],'with '+Fore.MAGENTA+WP)
                        ActiveEnemies[x][2] -= Damage[0]
                        DealFire(x)
                        
                        
                        if 'Wide Swipe' in SwordProficency: 
                            if Target < len(ActiveEnemies):
                                x = Target                                
                                print('you have dealt',Damage[0],'damage to',ActiveEnemies[x][0],'with '+Fore.MAGENTA+WP)
                                ActiveEnemies[x][2] -= Damage[0]
                                DealFire(x)


                        StP -= SwordProficency[1]

                        
                    else:
                        print('not enough stamina')


        
#                   Broadsword



                elif WP[3:len(WP)]=='broadsword':
                    if BroadswordProficency[1] <= StP:


                        x = Target-1                        
                        print('you have dealt',Damage[0],'damage to',ActiveEnemies[x][0],'with '+Fore.MAGENTA+WP)
                        ActiveEnemies[x][2] -= Damage[0]
                        Fire(x)


                        StP -= BroadswordProficency[1]



                    else:
                        print('not enough stamina')

                        

                else:
                    print('no weapon equipped\n')


                print('')

                TakeFireDamage()



































































































  
#       -----------------------------
#       -     Attack - Spell        -
#       -----------------------------



#                   Choosing target


 
        elif str.lower(Call[0:11]) == 'spellattack':

            SpellCheck()

            if MP == 0:
                print('not enough mana\n')

                
            else:
                if len(ActiveEnemies)>1:

                    
                    ShowActiveEnemies()
                    print('')
                    Target=input('who would you like to attack?')
                    Target=int(Target)
                    while Target<1 or Target>len(ActiveEnemies):  
                        print('please enter a value between 1 and',len(ActiveEnemies),'\n')
                        Target=input('who would you like to attack?')
                else:
                    Target=1



#               ---Dealing damage based on spell---




#                   Lightning



                if ESp=='lightning':
                    if SpellProficency[1] <= MP:
                        

                        i = random.randint(1,2)
                        if i == 1:
                            if Target > 1:  
                                x = Target-2
                                print('you have dealt',Damage[0],'damage to',ActiveEnemies[x][0],'with '+Fore.CYAN+ESp)
                                ActiveEnemies[x][2] -= Damage[0]
                                DealFire(x)

                                
                        x = Target-1  
                        print('you have dealt',Damage[0],'damage to',ActiveEnemies[x][0],'with '+Fore.MAGENTA+WP)
                        ActiveEnemies[x][2] -= Damage[0]
                        DealFire(x)
                        
                        
                        i = random.randint(1,2)
                        if i == 1:
                            if Target < len(ActiveEnemies):
                                x = Target                                
                                print('you have dealt',Damage[0],'damage to',ActiveEnemies[x][0],'with '+Fore.CYAN+ESp)
                                ActiveEnemies[x][2] -= Damage[0]
                                DealFire(x)



                if ESp=='lifesteal':
                    if SpellProficency[1] <= MP:

                                
                        x = Target-1
                        print('you have Stolen',Damage[0],'life from',ActiveEnemies[x][0],'with '+Fore.MAGENTA+ESp)
                        ActiveEnemies[x][2] -= Damage[0]
                        HP += Damage[0]




                if ESp=='fatigue':
                    if SpellProficency[1] <= MP:

                                
                        x = Target-1
                        i = random.randint(1,3)
                        if i < 3:
                            print('you have dealt',Damage[0],'damage to',ActiveEnemies[x][0],'with '+Fore.MAGENTA+ESp)
                            ActiveEnemies[x][2] -= Damage[0]
                        ActiveEnemies[x][7] = 0
                        


                        if HP > MHP:
                            HP = MHP


                        MP -= SpellProficency[1]






























































































#       -----------------------------
#       -        After Fight        -
#       -----------------------------



#           enemy death



        for x in range(0,len(ActiveEnemies)):
            if ActiveEnemies[x][2]<=0:

                
                print('you have killed',ActiveEnemies[x][0]+'('+str(x+1)+')'+'!')
                print('+'+str(ActiveEnemies[x][3])+'XP!')
                XP += ActiveEnemies[x][3]
                tmp7=random.randint(20,30)
                print('+'+str(tmp7)+'ɮ')
                Money+=tmp7
                del ActiveEnemies[x]
                print('')
                break

            
        ShowActiveEnemies()


#                   After Fight Variable Fix

                  
    if FireState[0] == 1:

        
        print('you put the fire out as the chaos dies down')
        FireState = []

    RunAttempt = 0



































































































     
#       --------------------------------
#       -          MAIN IDLE           -
#       --------------------------------




def Idle():
    global LVL
    global XP
    global SP
    global WP
    global HP
    global MHP
    global MP
    global MMP
    global ActiveEnemies
    global SwordDamage
        
    while HP>0:
        tmp1=0
    
        while XP>=200:
            LVL += 1
            XP -= 200
            SP += 1
            print('Level up to level',str(LVL)+'!',SP,'points available!')
            print('')

        if HP>MHP:
            HP=MHP

        WeaponCheck()
        SpellCheck()
        
        Call=input(':>')
        Call=Call.lower()

        time.sleep(Delay)


#           help
        if str.lower(Call[0:4]) == 'help':
            Help()

#           characteroverview
        elif str.lower(Call[0:4]) == 'char':
            CharacterOverview()

           
        elif str.lower(Call[0:6]) == 'invuse':
            if len(Call)>7:
                if Call[6] == ' ':
                    UseItemFromInventory(Call)
                else:
                    print('leave a space inbetween the command and the entered text.')
                    
#           invunequip
        elif str.lower(Call[0:5]) == 'invun':
            InvUnequip()
            
        elif str.lower(Call[0:8]) == 'spelluse':
            if len(Call)>9:
                if Call[8] == ' ':
                    UseSpell(Call)
                else:
                    print('leave a space inbetween the command and the entered text.')
            
#           spellunequip
        elif str.lower(Call[0:7]) == 'spellun':
            UnequipSpell()
            
#           skillspend
        elif str.lower(Call[0:7]) == 'skillsp':
            SpendSkillPoints()
        
#           explore
        elif str.lower(Call[0:4]) == 'expl':
            Explore()

        elif str.lower(Call[0:4]) == 'Area':
            Area()

        elif str.lower(Call[0:5]) == 'space':
            Space()



        else:
            print('no command found. type \'help\' for a list of commands\n')




































































































#       --------------------------------
#       -          MAIN RUN            -
#       --------------------------------



while True:
    SetVar()
    Intro()
    Idle()  


    
    


    
        
        
