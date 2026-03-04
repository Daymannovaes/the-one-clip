from obswebsocket import obsws, requests

class OBSController:
    def __init__(self, host='localhost', port=4455, password=''):
        self.ws = obsws(host, port, password)
        self.ws.connect()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.ws.disconnect()

    def start_recording(self):
        self.ws.call(requests.StartRecord())

    def stop_recording(self):
        self.ws.call(requests.StopRecord())

    def start_streaming(self):
        self.ws.call(requests.StartStream())

    def stop_streaming(self):
        self.ws.call(requests.StopStream())

    def switch_scene(self, scene_name):
        self.ws.call(requests.SetCurrentProgramScene(sceneName=scene_name))

    def get_scenes(self):
        scenes = self.ws.call(requests.GetSceneList())
        return [scene['sceneName'] for scene in scenes.getScenes()]

    def toggle_source_visibility(self, scene_name, source_name):
        current_scene = self.ws.call(requests.GetSceneItemList(sceneName=scene_name))
        for item in current_scene.getSceneItems():
            if item['sourceName'] == source_name:
                current_visible = item['sceneItemEnabled']
                self.ws.call(requests.SetSceneItemEnabled(
                    sceneName=scene_name,
                    sceneItemId=item['sceneItemId'],
                    sceneItemEnabled=not current_visible
                ))
                break 
