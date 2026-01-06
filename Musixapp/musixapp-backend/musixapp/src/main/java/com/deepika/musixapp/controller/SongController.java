package com.deepika.musixapp.controller;

import com.deepika.musixapp.model.Song;
import com.deepika.musixapp.repository.SongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600, allowCredentials = "true")
@RestController
@RequestMapping("/api/songs")
public class SongController {

    @Autowired
    SongRepository songRepository;

    /*@GetMapping("/all")
    public List<Song> getAllSongs() {
        return songRepository.findAll();
    }*/
    @GetMapping("/all")
    public ResponseEntity<List<Song>> getAllSongs() {
        List<Song> songs = songRepository.findAll();

        if (songs.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(songs, HttpStatus.OK);
    }
    /*@GetMapping("/search")
    public List<Song> searchByArtist(@RequestParam String artist) {
        return songRepository.findByArtistContainingIgnoreCase(artist);
    }
    @GetMapping("/genre")
    public ResponseEntity<List<Song>> getSongsByGenre(@RequestParam String genre) {
        List<Song> songs = songRepository.findByGenreContainingIgnoreCase(genre);

        if (songs.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }

        return new ResponseEntity<>(songs, HttpStatus.OK);
    }*/
    @GetMapping("/search")
    public List<Song> searchSongs(@RequestParam String query) {
        // We pass the same 'query' string to all three fields
        return songRepository.findByTitleContainingIgnoreCaseOrArtistContainingIgnoreCaseOrGenreContainingIgnoreCase(
                query, query, query
        );
    }
    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')") // Optional: Only allow Admins to delete
    public ResponseEntity<?> deleteSong(@PathVariable Long id) {
        return songRepository.findById(id)
                .map(song -> {
                    songRepository.delete(song);
                    return ResponseEntity.ok("Song deleted successfully!");
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/add")
    @PreAuthorize("hasRole('ROLE_USER') or hasRole('ROLE_ADMIN')")
    public Song addSong(@RequestBody Song song) {
        return songRepository.save(song);
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> updateSong(@PathVariable Long id, @RequestBody Song songDetails) {
        return songRepository.findById(id)
                .map(song -> {
                    // Update the fields (Make sure these names match your Song.java fields)
                    song.setTitle(songDetails.getTitle());
                    song.setArtist(songDetails.getArtist());
                    song.setAlbum(songDetails.getAlbum());
                    // song.setGenre(songDetails.getGenre()); // Add this if you have a genre field

                    songRepository.save(song);
                    return ResponseEntity.ok("Song updated successfully!");
                })
                .orElse(ResponseEntity.notFound().build());
    }
}