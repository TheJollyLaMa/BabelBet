import smtplib, ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders

def chooseChallenge():
    challengeID = str(uuid.uuid4().int)[-16:]
    for each in challengeTypeList:
        print(each)
    challengeType = input("What type of challenge do you want to propose to your fellow Languanaut? ")
    activeChallengeList.append({'challengeID': challengeID, 'challengeType': challengeType })
    return challengeType
#  email: SolarMail888@gmail.com     pass:FuckYourPasswordRules
def sendChallengeProposalEmail(_languanaut1, _languanaut2, _terms):
    challenge_state = "negotiating"
    USERNAME = 'boyyee44@gmail.com' # input("What is your email? ")
    PASSWORD = '' # input("What is your email? ")
    MAILTO = 'solarmail888@gmail.com' # input("What is your fellow Languanaut's email? ")

    msg = MIMEMultipart()
    msg['Subject'] = "On Guard! " + str(_languanaut1['name']) + " challenges you to a " + str(_terms[0]) + " challenge on DuoLingo on Ethereum in Matic Token!"
    msg['From'] = USERNAME
    msg['To'] = MAILTO
    html = "<html><head></head><body>"
    html += "<p><h3>" + str(_languanaut1['name']) + "</h3> challenges you to a " + str(_terms[0]) + "on DuoLingo!</p>"
    html += "<p>" + str(_languanaut1['name']) + " thinks they can reach a <h3>" + str(_terms[1]) + "</h3>  day streak! Do you believe you can keep a longer streak than them?</p>"
    html += "<p>They are so sure they are more dedicated than you, they staked " + str(_terms[2]) + " matic on it!</p>"
    html += "<p>If you think you can outlast their streak, see thier " + str(_terms[2]) + " matic and prove it!</p>"
    html += """<p><a href='http://localhost:8888/Stake/""" + str(_terms[2]) + """'><button height='75px' width='100px'>Accept & Stake</button></a></p>"""
    html += "<br><br><p>Or you can suggest differenet terms.</p>"
    html += "<p><a href='http://localhost:8888/CounterOffer'><button height='75px' width='100px'>Propose Changes</button></a></p><br><br>"
    html += "</body></html>"

    msg.attach(MIMEText(html, 'html'))

    server = smtplib.SMTP('smtp.gmail.com:587')
    server.starttls()
    server.login(USERNAME,PASSWORD)
    server.sendmail(USERNAME, MAILTO, msg.as_string())
    server.quit()
    print("proposal sent ...")

def sendChallengeAcceptanceEmail(_languanaut2, _languanaut1, _terms):
    challenge_state = "accepted"
    USERNAME = 'SolarMail888@gmail.com'# languanaut2
    PASSWORD = 'FuckYourPasswordRules' # languanaut2 pass
    MAILTO = 'boyyee44@gmail.com' # languanaut1

    msg = MIMEMultipart()
    msg['Subject'] = "On Guard! You got yourself a Lingo Dual " + _languanaut1 + "!"
    msg['From'] = USERNAME
    msg['To'] = MAILTO
    html = """
        <html>
            <head></head>
            <body>
                <p> I accept your terms, """ + str(_languanaut1) + """, for a """ + _terms[0] + """ challenge on DuoLingo for """ + _terms[1] + """ days and """ + _terms[2] + """ Matic!"
                </p>
            </body>
        </html>
    """
    msg.attach(MIMEText(html, 'html'))

    server = smtplib.SMTP('smtp.gmail.com:587')
    server.starttls()
    server.login(USERNAME,PASSWORD)
    server.sendmail(USERNAME, MAILTO, msg.as_string())
    server.quit()

def sendCounterOfferEmail(_languanaut2, _languanaut1, _terms):
    challenge_state = "negotiating"
    USERNAME = 'SolarMail888@gmail.com'# languanaut2
    PASSWORD = 'FuckYourPasswordRules' # languanaut2 pass
    MAILTO = 'boyyee44@gmail.com' # languanaut1

    msg = MIMEMultipart()
    msg['Subject'] = "Idk " + _languanaut1 + ". What about ..."
    msg['From'] = USERNAME
    msg['To'] = MAILTO
    html = """
        <html>
            <head></head>
            <body>
                <p> How about , """ + str(_languanaut1) + """, for a """ + _terms[0] + """ challenge on DuoLingo for """ + _terms[1] + """ days and """ + _terms[2] + """ Matic!"
                </p>
            </body>
        </html>
    """
    msg.attach(MIMEText(html, 'html'))

    server = smtplib.SMTP('smtp.gmail.com:587')
    server.starttls()
    server.login(USERNAME,PASSWORD)
    server.sendmail(USERNAME, MAILTO, msg.as_string())
    server.quit()

def showdown_streak_challenge(_languanaut1, _languanaut2):
    print("So you think you're more dedicated to Duolingo than ", _languanaut2['name'])
    streak_proposal = int(input("How many days streak do you want to challenge them to? "))
    stake_proposal = float(input("Ok. Put your money where your lingo is.  How much do you propose to stake? "))
    terms = ["Show Down(Streak)", streak_proposal, stake_proposal]
    challenge_state = "negotiating"
    sendChallengeProposalEmail(_languanaut1, _languanaut2, terms)

def defineTerms(languanaut1, languanaut2):
    challenge = chooseChallenge()
    if challenge == "Show Down(Streak)":
        showdown_streak_challenge(languanaut1, languanaut2)
    elif challenge == "Show Down(Level)":
        showdown_level_challenge(languanaut1, languanaut2)
    elif challenge == "XP Earned":
        xp_earned_challenge(languanaut1, languanaut2)
    elif challenge == "Tight Rope":
        tight_rope_challenge(languanaut1, languanaut2)
