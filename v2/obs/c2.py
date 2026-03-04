import obswebsocket
from obswebsocket import obsws, events, requests

client = obswebsocket.obsws("localhost", 4455, "KNTkKNSmDVPKjCXq") #Change this if you have a different name, port or password
client.connect()
client.call(obswebsocket.requests.GetFilenameFormatting())
print("Hi! I'm your new video\nWhat's my name?\nFilename:")
client.call(requests.SetCurrentProgramScene(sceneName="Scene 1"))

client.call(requests.SetFilenameFormatting(" - %MM-%DD %hh-%mm")) #Custom name + date. The best of two worlds
client.call(requests.StartRecording())
print(client.call(requests.GetFilenameFormatting()))
client.call(requests.SetFilenameFormatting("-%MM-%DD %hh-%mm-%ss"))
print(client.call(requests.GetFilenameFormatting()))
client.disconnect()
