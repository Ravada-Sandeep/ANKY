create database anky_db

use anky_db

create table users(
id int auto_increment primary key,
name varchar(100),
email varchar(100) unique,
password varchar(255),
created_at timestamp default current_timestamp
);

create table subjects(
id int auto_increment primary key,
user_id int,
subject_name varchar(100),
created_at timestamp default current_timestamp,
foreign key (user_id) references users(id) on delete cascade
);

create table topics(
id int auto_increment primary key,
subject_id int,
topic_name varchar(150),
created_at timestamp default current_timestamp,
foreign key (subject_id) references subjects(id) on delete cascade
);


create table flashcards(
id int auto_increment primary key,
topic_id int,
question text,
answer text,

next_review_date date,
interval_days int default 1,
last_reviewed date,

correct_attempts int default 0,
total_attempts int default 0,
retention_score float default 0,
created_at timestamp default current_timestamp,
foreign key (topic_id) references topics(id) on delete cascade
);