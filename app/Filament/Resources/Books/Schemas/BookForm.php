<?php

namespace App\Filament\Resources\Books\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class BookForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('author_id')
                    ->required()
                    ->numeric(),
                TextInput::make('category_id')
                    ->required()
                    ->numeric(),
                TextInput::make('title')
                    ->required(),
                TextInput::make('slug')
                    ->required(),
                Textarea::make('description')
                    ->required()
                    ->columnSpanFull(),
                TextInput::make('cover'),
                TextInput::make('language')
                    ->required()
                    ->default('ar'),
                TextInput::make('pages')
                    ->numeric(),
                TextInput::make('publication_year')
                    ->numeric(),
                TextInput::make('edition'),
                TextInput::make('isbn'),
                TextInput::make('legal_deposit'),
                TextInput::make('publication_type')
                    ->required(),
                TextInput::make('price_digital')
                    ->numeric(),
                TextInput::make('price_print')
                    ->numeric(),
                TextInput::make('price_2')
                    ->numeric(),
                TextInput::make('price_3')
                    ->numeric(),
                TextInput::make('price_4')
                    ->numeric(),
                TextInput::make('sale_email')
                    ->email(),
                TextInput::make('status')
                    ->required()
                    ->default('pending'),
                DateTimePicker::make('published_at'),
                TextInput::make('downloads_count')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('views_count')
                    ->required()
                    ->numeric()
                    ->default(0),
            ]);
    }
}
