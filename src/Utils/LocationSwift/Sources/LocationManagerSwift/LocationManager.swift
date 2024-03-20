import Foundation
import CoreLocation

@objc public class Location: NSObject {
    public var latitude: Double
    public var longitude: Double

    init(latitude: Double, longitude: Double) {
        self.latitude = latitude
        self.longitude = longitude
    }
}

@objc public protocol LocationManagerDelegate: AnyObject {
    func didUpdateLocations(_ manager: LocationManager, locations: [Location])
}

public class LocationManager: NSObject, CLLocationManagerDelegate {
    private var locationManager: CLLocationManager = CLLocationManager()

    @objc public weak var delegate: LocationManagerDelegate?

    override public init() {
        super.init()
    }

    @objc public func start() {
        locationManager.delegate = self
        let status = locationManager.authorizationStatus
        handleLocationAuthorizationStatus(status)
    }

    @objc public func startUpdatingLocation() {
        locationManager.startUpdatingLocation()
    }

    @objc public func stopUpdatingLocation() {
        locationManager.stopUpdatingLocation()
    }

    private func setupLocationManager() {
        locationManager.desiredAccuracy = kCLLocationAccuracyBest
        locationManager.activityType = .fitness
        locationManager.allowsBackgroundLocationUpdates = true
        locationManager.pausesLocationUpdatesAutomatically = false
    }

    private func handleLocationAuthorizationStatus(_ status: CLAuthorizationStatus) {
        switch status {
        case .notDetermined:
            locationManager.requestAlwaysAuthorization()
        case .authorizedWhenInUse, .authorizedAlways:
            setupLocationManager()
            startUpdatingLocation()
        case .restricted, .denied:
            stopUpdatingLocation()
        @unknown default:
            break
        }
    }

    public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        let convertedLocations = locations.map { Location(latitude: $0.coordinate.latitude, longitude: $0.coordinate.longitude) }
        delegate?.didUpdateLocations(self, locations: convertedLocations)
    }

    public func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        handleLocationAuthorizationStatus(manager.authorizationStatus)
    }
}
