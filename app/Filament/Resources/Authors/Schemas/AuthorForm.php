<?php

namespace App\Filament\Resources\Authors\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class AuthorForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('user_id')
                    ->numeric(),
                TextInput::make('name')
                    ->required(),
                TextInput::make('slug')
                    ->required(),
                TextInput::make('title')
                    ->required()
                    ->default('none'),
                Textarea::make('bio')
                    ->required()
                    ->columnSpanFull(),
                TextInput::make('photo'),
                TextInput::make('phone')
                    ->tel(),
                TextInput::make('address'),
                Textarea::make('extra')
                    ->columnSpanFull(),
            ]);
    }
}
