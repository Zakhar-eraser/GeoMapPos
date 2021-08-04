import pymysql.cursors
import math

class GeoMap:
    def __init__(self, ID = 1, user = 'ezard_waypoints', password = 'Vtq8exeT&zVwdW8', latitude = 55.8134, longitude = 37.4984):
        self._ID = ID
        self._user = user
        self._password = password
        self._latitude = latitude
        self._longitude = longitude

    def ReadAndHandle(self, id, norm, parallel):
        connection = pymysql.connect(host='ezard.beget.tech', user=self._user, password=self._password, db='ezard_waypoints', charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor)
        sql1 = "Select latitude, longitude, angle from waypoints Where id = %s"
        try:
            cursor = connection.cursor()
            cursor.execute(sql1, (id))
            row = cursor.fetchone()
            angle = row["angle"]
            Rearth = 6371160.0
            X = -parallel*math.cos(angle) - norm*math.sin(angle)
            Y = -parallel*math.sin(angle) + norm*math.cos(angle)
            self._longitude = row["longitude"] + 180.0*X/(Rearth*math.cos(row["latitude"]*math.pi/180.0))/math.pi
            self._latitude = row["latitude"] + 180.0*Y/Rearth/math.pi
        finally:
            connection.close()
    
    def WritePosition(self):
        connection = pymysql.connect(host='ezard.beget.tech', user=self._user, password=self._password, db='ezard_waypoints', charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor)
        sql2 = "UPDATE UAVs SET latitude = %s, longitude = %s WHERE id = %s"
        try:
            cursor = connection.cursor()
            cursor.execute(sql2, (self._latitude, self._longitude, self._ID))
            connection.commit() 
        finally:
            connection.close()
    
    def GetGeoCoordinates(self):
        return self._latitude, self._longitude