# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a BDD specification repository for an OnlineCalendar application. The repository contains Gherkin feature files written in Japanese that define the behavior and requirements for an online calendar system.

## Architecture

The project uses Behavior-Driven Development (BDD) methodology with feature files written in Japanese Gherkin syntax. The main features include:

- **Meeting Creation**: Basic meeting creation with owner, start/end times, and title
- **Participant Management**: 50-person participant limit enforcement
- **Meeting Rescheduling**: Ability to change future meeting times with automatic notifications
- **Reminder System**: Intelligent reminder generation (15 minutes for normal meetings, 60 minutes for important meetings)
- **Notification Delivery**: Multi-channel notification system supporting email

## Feature Files Structure

All feature files are located in the `features/` directory:
- `meeting_creation.feature` - Core meeting creation functionality
- `participant_limit.feature` - Participant count validation (max 50)
- `reschedule_meeting.feature` - Meeting time modification with notifications
- `reminder_generation.feature` - Smart reminder timing based on meeting importance
- `notification_sending.feature` - Notification delivery mechanisms

## Key Business Rules

- Maximum 50 participants per meeting
- Normal meetings: 15-minute reminder
- Important meetings: 60-minute reminder
- Rescheduling triggers "MeetingRescheduled" notifications to all participants
- Only future meetings can be rescheduled

## Development Notes

This repository contains only BDD specifications. The feature files are designed to be executed with BDD tools like Cucumber-JVM. When implementing the actual system, these scenarios should drive the development of the calendar application's core functionality.