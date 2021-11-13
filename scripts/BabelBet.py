# 8NOV2021 Justin LaManna, aka: "TheJollyLaMa"
# many thanks to KartikTalwar, the programmer of the 'unofficial Duolingo API' found on github
#Throws error when using Google Auth for Duolingo Login - have to use regular sign in flow.
import uuid
import duolingo
import BabelBet_functions as BabelBet
my_name = '' # Duolingo Name     str(input('What is your Duolingo Username: '))
yo_name = '' # opponent = input("What is the Duolingo username of the Languanaut you'd like to challenge?")
my_pass = '' # Duolingo Pass    str(input('Duolingo Password: '))
yo_pass = ''
my_acc = "" # Eth account you want to withdraw from and pay to if you win challenge
yo_acc = "" # Eth account of your opponent
my_lingo = duolingo.Duolingo(my_name, my_pass)
yo_lingo = duolingo.Duolingo(yo_name, yo_pass)
my_duo_info = my_lingo.get_user_info()
yo_duo_info = yo_lingo.get_user_info()
# print out items in user info
# for item in my_duo_info:
#     print(item + ': ' + str(my_duo_info[item]))
my_duo_name = my_duo_info['username']
yo_duo_name = yo_duo_info['username']
# my_duo_bio = my_duo_info['bio']
# my_duo_bio = my_duo_info['bio']
print(my_duo_name + ' vs. ' + yo_duo_name)

my_duo_lang_list = my_lingo.get_languages()
yo_duo_lang_list = yo_lingo.get_languages()

my_robo_lang_list = ['Python','Java','PHP','NodeJS','Express','HTML','CSS','JavaScript','AngularJs','Solidity','Web3.0','MySQL']
yo_robo_lang_list = ['Python','Java','PHP','HTML','CSS','JavaScript','React','Solidity','Web3.0','MongoDb']

languanaut1 = {
    'name' : my_duo_name,
    'account' : my_acc
}

languanaut2 = {
    'name' : yo_duo_name,
    'account' : yo_acc
}
challengeTypeList = ["Show Down(Streak)", "Show Down(Level)", "XP Earned", "Tight Rope"]
    # streak show down - choose a streak to challenge an opponent to. If you both make it, you can up the anti, keep it the same, or take your funds and run minus the chain fees
    # level show down - choose how many levels to race your opponent to.  First to so many takes the pot.
    # XP Earned - earn more XP than your opponent and get their staked funds!
    # Tight Rope - first to make a mistake loses their staked funds!
    #funds in escrow are deposited to an interest bearing account.  Interest earned on escrow is split with the Bookie Contract 50/50
challenge_state = "" #negotiating, active/executing, terminated/complete
activeChallengeList = []

BabelBet.defineTerms(languanaut1, languanaut2)
# ##### #
#  either of these two end points will be wiating to be hit in Express
#  http://localhost:8888/Stake/:amount
#    *** will stake amount in contract
#    *** will email initiator to confirm challenge acceptance and commencement

#  http://localhost:8888/ChangeTerms/
#    *** will have a simple front end to propose change in terms
#
# ##### #





"""
    Challenges:
        each challenge has different payout amounts and rules
        Win case:
        Loss case:
            You lose your staked funds
            Your opponent gains your staked funds
        Tie Case:
            Keep running and keep Stakes
            Up the Stakes
            Get out of the agreement with most of your funds

        When conditions are met, smarth contract executes accordingly
        stake in crypto or in duolingo lingots, streak freeazes, and other buyables
"""


"""
language_data = my_duo_info['language_data']
print('\n\nlanguage data: ' + str(language_data) + '\n\n')

duo_skills = language_data['hi']['skills']
print('skills data: ' + str(duo_skills) + '\n\n')
for item in duo_skills[0]:
    print(item + ': ' + str(duo_skills[0][item]))

for item in language_data['hi']:
    print(item)
"""

"""
print a funny message with both language lists
duomsg = '\nIf I miss speak, you\'ll have to forgive me.  I am learning to speak: '
robomsg = '\n\nIf I miss type, you\'ll have to forgive me.  I am learning to program in: '
for num, lang in enumerate(my_duo_lang_list):
    if num < len(my_duo_lang_list) - 1:
        duomsg += lang + ', '
    else:
        duomsg += 'and ' + lang + '.'
print(duomsg)
for num, lang in enumerate(robo_lang_list):
    if num < len(robo_lang_list) - 1:
        robomsg += lang + ', '
    else:
        robomsg += 'and ' + lang + '.'
print(robomsg)
"""

"""
user input: DuoLingo username and password
user input: Eth address


get friends list

choose challenge
    userinput

user input: invite outsiders to play by email

invite someone to a challenge on Duolingo
def showDownChallenge(languanaut1, languanaut):
    if notOnDuolingo:
         send invite

    if user isOnDuolingo:
        see certain opponent user stats
        select a challenge to propose
            Streak Challenges
            Level/Time Duration Challenges

        Propose the stakes
            send email to opponent to propose a challange and agree on stakes

            opponent negative response:
                opponent proposes a change in the terms or denies engagement
                    initiator rebuts again or agreement is made
            else (affirmative):
                Stakes go to Smart Contract Escrow
                Challenge begins


invite group to a challenge on Duolingo

langGang = [] # list of languanauts to invite to a group challenge
def groupChallenge(langGang):
    group challenges where participants stake funds and are awarded payouts on rank


    Challenges:
        each challenge has different payout amounts and rules
        Win case:
        Loss case:
            You lose your staked funds
            Your opponent gains your staked funds
        Tie Case:
            Keep running and keep Stakes
            Up the Stakes
            Get out of the agreement with most of your funds

        When conditions are met, smarth contract executes accordingly
        stake in crypto or in duolingo lingots, streak freeazes, and other buyables


def locateALanguanaut():
    friend matching service that uses both spoken languages and computer languages to generate
    a list of people that you are able to communicate with based on the similar linguistic patterns.


def willYouDonate():
    msg = "Jolly LaMa channeled the Holy Spirit and provided this work for you all to enjoy for the rest of time. "
    msg += "Bet responsibily and may your sweet words sooth each other like the days before the Curse of Babel.  "
    msg += "If you have enjoyed BabelBet, and would like to see other Jolly Creations, please donate whatever you can spare to: \n\n"
    msg += OA_account
    msg += "\n\n"
    msg += "*** end shameless plug ***"
"""
