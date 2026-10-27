# Architecture

A small Spring Boot process serves the REST API and static frontend. The baseline uses an in-memory list of sample tasks to minimise setup. H2 is included as a dependency for optional extension but tasks are not persisted in this starter.
